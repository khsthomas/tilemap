/**
	本文件是JS API之中的PG.EdittingMPolyLine類,此類沒有公開

	這個類的主要用於編輯面(PG.PolygonEntity)和折線(PG.PolylineEntity)
*/
function NPGdittingMPolyLine()
{	
	/**
		描述一個正在被編輯之中的面(PG.PolygonEntity)和折線(PG.PolylineEntity)
			
		points : PG.PolygonEntity 或者 PG.PolylineEntity
		isPolygon : 標誌被編輯的對象是否為面

	*/
	function EdittingMPolyLine(points,isPolygon)
	{
		this.line=points;
		this.isPolygon=isPolygon;
//		鼠標移上編輯
		this.onmarker = false;
		this.onpolygon = false;
		this.markerDraging = false;

		this.markers=[];
//		編輯時的虛線
		this.editorPolyLine = new PG.PolylineEntity([new PG.Point(0,0,false)]);
//		this.editorPolyLine.SetLineColor("green");	//設置折線顏色
		this.editorPolyLine.SetLineStyle("Dash");	//設置折線線型
//		this.editorPolyLine.SetLineStroke(2);	//設置折線線寬
		this.editorPolyLine.SetOpacity(0.8);	//設置折線透明度
		
		this.imgPath = window.PG._IMG_PATH+"polygon/cursor/crosshairs.cur";
	}
	PG.EdittingMPolyLine = EdittingMPolyLine;

	/**
		返回被編輯的面或折線信息
	*/
	PG.EdittingMPolyLine.prototype.getLineInfo=function()
	{
		var points=this.getPoints();
		if(this.isPolygon)
		{
			var area=PG.PolygonTool.getPointsArea(points);
			var info=(area>1000000)?(parseInt(area/10000)/100+"平方公里"):(area+"平方米");
			return "總面積"+info;
		}
		else
		{
			var dis=PG.PolyLineTool.getPointsDistance(points);
			var info=(dis>1000)?(parseInt(dis/100)/10+"公里"):(dis+"米");
			return "總距離"+info;
		}
	};

	/**
		
	*/
	PG.EdittingMPolyLine.prototype.onChange=function()
	{
		PG.Event.trigger(this,"change",[]);
	};

	/**
		返回被編輯面或折線信息的所有點
	*/
	PG.EdittingMPolyLine.prototype.getPoints=function()
	{
		return this.line.getPoints();
	};

	/**
		設置被編輯面或折線信息的所有點
	*/
	PG.EdittingMPolyLine.prototype.setPoints=function(points)
	{
		return this.line.setPoints(points);
	};

	/**
		刪除
	*/
	PG.EdittingMPolyLine.prototype.remove=function()
	{
		//this.editor.editor.map.RemoveEntity(this.line);
	};

	/**
		返回被操作的編輯點

	*/
	PG.EdittingMPolyLine.prototype.getMarkerIndex=function(marker)
	{
		for(var i=0;i<this.markers.length;i++)
		{
			if(this.markers[i]==marker)
			{
				return i;
			}
		}
	};

	/**
		返回編輯點開始拖動時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.getDragStartCallback=function(type,marker)
	{
		return function(point)
		{
			this.markerDraging = true;
			var index=this.getMarkerIndex(marker);
			var points=this.getPoints();
			this.clonePts = this.copyPoints(points);
			this.clonePts.oldPolygon = this.getPoints();
			if(type=="mid")
			{
				this.clonePts=this.clonePts.slice(0,index+1).concat([point],this.clonePts.slice(index+1));
				this.clonePts.oldPoint = point;
				var points=this.clonePts;
				if(this.isPolygon){
					if(index==points.length-2){
						this.editorPolyLinePoints = [points[index],points[index+1],points[0]];
					}else{
						this.editorPolyLinePoints = [points[index],points[index+1],points[index+2]];
					}
				}else{
					this.editorPolyLinePoints = [points[index],points[index+1],points[index+2]];
				}
			}
			else if(type=="self")
			{
				this.clonePts[index]=point;
				if(PG.Tool.browserInfo().isWebKit){
					marker.marker.icon.GetDivObject().style.cursor="url("+this.imgPath+") 9 9,n-resize";
				}else{
					marker.marker.icon.GetDivObject().style.cursor="url("+this.imgPath+"),n-resize";
				}
				if(index==0){
					if(this.isPolygon){
						this.editorPolyLinePoints = [points[points.length-1],points[index],points[index+1]];
					}else{
						this.editorPolyLinePoints = [points[index],points[index+1]];
					}
				}else if(index==points.length-1){
					if(this.isPolygon){
						this.editorPolyLinePoints = [points[points.length-2],points[index],points[0]];
					}else{
						this.editorPolyLinePoints = [points[index-1],points[index]];
					}
				}else{
					this.editorPolyLinePoints = [points[index-1],points[index],points[index+1]];
				}
			}	
			this.editorPolyLine.setPoints(this.editorPolyLinePoints);
			this.line.map.AddEntity(this.editorPolyLine);
		}
	};

	/**
		返回編輯點拖動時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.getDragCallback=function(type,marker)
	{
		return function(point)
		{
			var points = this.clonePts;
			var index=this.getMarkerIndex(marker);
			if(type=="mid")
			{				
				this.editorPolyLinePoints[1]=point;
				this.clonePts[index+1]=point;
			}
			else if(type=="self")
			{
				this.clonePts[index]=point;
				if(this.isPolygon){
					this.editorPolyLinePoints[1] = point;
				}else if(index==0){
					this.editorPolyLinePoints[0] = point;
				}else if(index==this.clonePts.length-1){
					this.editorPolyLinePoints[1] = point;
				}else{
					this.editorPolyLinePoints[1]=point;
				}
				this.reDrawMarkers(index,this.clonePts);
			}
			this.editorPolyLine.setPoints(this.editorPolyLinePoints);
			this.editorPolyLine.reDraw(true);
		}
	};

	/**
		返回編輯點拖動結束時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.getDragEndCallback=function(type,marker)
	{
		return function()
		{
			this.markerDraging = false;
			this.line.map.RemoveEntity(this.editorPolyLine);
			var index=this.getMarkerIndex(marker);
			if(type=="mid")
			{
				var map = this.line.map;
				var znt = map.getZoomUnits(map.GetZoomLevel(),true);
				var pxx = Math.abs((this.clonePts.oldPoint.MercatorLng-this.editorPolyLinePoints[1].MercatorLng)/znt[0]);
				var pxy = Math.abs((this.clonePts.oldPoint.MercatorLat-this.editorPolyLinePoints[1].MercatorLat)/znt[1]);
				if(pxx>3||pxy>3){
					this.setPoints(this.clonePts);
					this.drawMarkers(index+1);
					this.reDrawMarkers(index);
				}
			}
			else if(type=="self")
			{
				this.setPoints(this.clonePts);
				if(index>0)
				{
					this.reDrawMarkers(index-1);
				}
				if(index<this.getPoints().length-1)
				{
					this.reDrawMarkers(index);
				}
				marker.marker.icon.GetDivObject().style.cursor="pointer";
			}			
			this.onChange();
		}
	};

	/**
		返回編輯點單擊時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.getClickCallback=function(marker)
	{
		return function()
		{
			var index=this.getMarkerIndex(marker);
			if(!this.nodeOperationDiv)
			{
				var doc=window.document;
				var linkStyle={color:"blue",margin:"2px"};
				var div=doc.createElement("div");
				var link=doc.createElement("a");
				PG.Tool.inherit(link.style,linkStyle);
				link.href="javascript://";
				link.innerHTML="刪除節點";
				div.appendChild(link);
				this.delNodeLink = link;				
				this.nodeOperationDiv=div;				
			}else{
				PG.Event.removeListener(this.delNodeLink.PG_lis);
			}
			var infowin=marker.marker.openInfoWinElement(this.nodeOperationDiv);
				this.delNodeLink.PG_lis = PG.Event.bind(this.delNodeLink,"click",this,this.delByParam(infowin));
				
			this.nodeIndex=index;
			infowin.setTitle("第"+(index+1)+"個軌跡頂點");
		}
	};

	/**
		刪除編輯點時的處理函數---刪除節點
	*/
	PG.EdittingMPolyLine.prototype.deleteNode=function(index)
	{
		var points=this.getPoints();
		var markers=this.markers[index];
		var map=this.line.map;
		markers&&map.RemoveEntity(markers.marker);
		markers&&(markers.marker=null);
		if(markers&&index!=points.length-1){
			map.RemoveEntity(markers.midMarker);
			markers.midMarker=null;
		}else{
			if(this.isPolygon){
				markers&&map.RemoveEntity(markers.midMarker);
				markers&&(markers.midMarker=null);
			}else{
				markers&&map.RemoveEntity(this.markers[index-1].midMarker);
				markers&&(this.markers[index-1].midMarker=null);
			}
		}
		markers&&this.markers.splice(index,1);
		this.line.points.splice(index,1);
		if(index!=0){
			this.reDrawMarkers(index-1);
		}
		this.line.reDraw(true);
		this.closeInfoWin();
	};

	/**
		刪除編輯點時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.delByParam = function(infowin){
		return function(){
			if(this.getPoints().length>(this.isPolygon?3:2))
			{
				this.deleteNode(this.nodeIndex);
			}
			else
			{
				var result=window.confirm("當前節點數目太少，您是要刪除整個折線麼？");
				if(result)
				{
					this.endEdit();
					this.line.map.RemoveEntity(this.line);
				}
			}
			infowin.closeInfoWindow();
		}
	};
	
	/**
		關閉信息窗口
	*/
	PG.EdittingMPolyLine.prototype.closeInfoWin=function(index){
		this.line.map.GetWindowEntity().CloseWindow();
	};

	/**
		滑過被編輯面或折線時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.onPolygonMOver = function(){
		this.onpolygon = true;
		this.startEditTrack();
	};

	/**
		滑出被編輯面或折線時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.onPolygonMOut = function(){
		this.onpolygon = false;
		setTimeout(PG.Event.getCallback(this,
					(function(){
						if(!this.onpolygon&&!this.onmarker&&!this.markerDraging){
							this.endEditTrack();
						}
					})
				),500);
	};

	/**
		滑過編輯點時的處理函數 
	*/
	PG.EdittingMPolyLine.prototype.onMarkerMOver = function(){
		this.onmarker = true;
	};

	/**
		滑出編輯點時的處理函數
	*/
	PG.EdittingMPolyLine.prototype.onMarkerMOut = function(){
		this.onmarker = false;
		setTimeout(PG.Event.getCallback(this,
					(function(){
						if(!this.onpolygon&&!this.onmarker&&!this.markerDraging){
							this.endEditTrack();
						}
					})
				),500);
	};

	/**
		開始編輯多面形或折線

	*/
	PG.EdittingMPolyLine.prototype.startEditTrack=function()
	{
		if(this.markers.length>0)
		{
			return;
		}
		for(var i=0;i<this.getPoints().length;i++)
		{
			this.drawMarkers(i);
		}
	};

	/**
		結束編輯
	*/
	PG.EdittingMPolyLine.prototype.endEditTrack=function()
	{
		var marker;
		while(marker=this.markers.pop())
		{
			this.line.map.RemoveEntity(marker.marker,true);
			this.line.map.RemoveEntity(marker.midMarker,true);
		}
	};

	/**
		得到中點
	*/
	PG.EdittingMPolyLine.prototype.getMiddlePoint=function(i,j,pots){
		if(!pots[i]||!pots[j]){return null;}
		return new PG.Point((pots[i].x+pots[j].x)/2,(pots[i].y+pots[j].y)/2,false);
	};

	/**
		編輯多面形,添加編輯點

	*/
	PG.EdittingMPolyLine.prototype.drawMarkers=function(i,pots)
	{
		var markers={},points=pots||this.getPoints();
		//輸出主要的標記
		var borderC=this.line.GetLineColor();
		var marker = PG.EdittingMPolyLine.getIconObj(points[i],[8,8],borderC,"#ffffff",1);
		marker.enableDrag(true);
		PG.Event.bind(marker,"OnDragStart",this,this.getDragStartCallback("self",markers));
		PG.Event.bind(marker,"OnDrag",this,this.getDragCallback("self",markers));
		PG.Event.bind(marker,"OnDragEnd",this,this.getDragEndCallback("self",markers));
		PG.Event.bind(marker,"OnClick",this,this.getClickCallback(markers));
		this.line.map.AddEntity(marker);
		markers.marker=marker;
		
		if(i!=points.length-1){
			var midPoint=this.getMiddlePoint(i,i+1,points);
			var centerMarker = PG.EdittingMPolyLine.getIconObj(midPoint,[8,8],borderC,"#ffffff",0.5);
			centerMarker.enableDrag(true);
			PG.Event.bind(centerMarker,"OnDragStart",this,this.getDragStartCallback("mid",markers));
			PG.Event.bind(centerMarker,"OnDrag",this,this.getDragCallback("mid",markers));
			PG.Event.bind(centerMarker,"OnDragEnd",this,this.getDragEndCallback("mid",markers));
			this.line.map.AddEntity(centerMarker);
			markers.midMarker=centerMarker;
		}		
		if(this.isPolygon&&i==points.length-1){
			var midPoint=this.getMiddlePoint(i,0,points);
			var centerMarker = PG.EdittingMPolyLine.getIconObj(midPoint,[8,8],borderC,"#ffffff",0.5);
			centerMarker.enableDrag(true);
			PG.Event.bind(centerMarker,"OnDragStart",this,this.getDragStartCallback("mid",markers));
			PG.Event.bind(centerMarker,"OnDrag",this,this.getDragCallback("mid",markers));
			PG.Event.bind(centerMarker,"OnDragEnd",this,this.getDragEndCallback("mid",markers));
			this.line.map.AddEntity(centerMarker);
			markers.midMarker=centerMarker;
		}
//		mouseover時開始編輯
		PG.Event.bind(markers.marker,"OnMouseOver",this,this.onMarkerMOver);
		PG.Event.bind(markers.marker,"OnMouseOut",this,this.onMarkerMOut);
		if(markers.midMarker){
			PG.Event.bind(markers.midMarker,"OnMouseOver",this,this.onMarkerMOver);
			PG.Event.bind(markers.midMarker,"OnMouseOut",this,this.onMarkerMOut);
		}
		
		this.markers=this.markers.slice(0,i).concat([markers],this.markers.slice(i));
	};

	/**
		重新設置編輯點的位置
	*/
	PG.EdittingMPolyLine.prototype.reDrawMarkers=function(i,pots)
	{
		var points=pots||this.getPoints();
		this.markers[i]&&this.markers[i].marker.setPoint(points[i]);
		if(i!=points.length-1){
			var midPoint=this.getMiddlePoint(i,i+1,points);
			this.markers[i]&&this.markers[i].midMarker.setPoint(midPoint);
		}
		if(i!=0){
			var midPoint=this.getMiddlePoint(i-1,i,points);
			this.markers[i]&&this.markers[i-1].midMarker.setPoint(midPoint);
		}
		if(this.isPolygon){
			if(i==points.length-1){
				var midPoint=this.getMiddlePoint(0,i,points);
				this.markers[i]&&this.markers[i].midMarker.setPoint(midPoint);
			}else if(i==0){
				var midPoint=this.getMiddlePoint(points.length-1,0,points);
				this.markers[i]&&this.markers[points.length-1].midMarker.setPoint(midPoint);
			}
		}
	};

	/**
		開始編輯多面形

	*/
	PG.EdittingMPolyLine.prototype.startEdit=function(){
		this.startEditTrack();
		var evt;
		if(this._evts){
			while(evt = this._evts.pop()){
				PG.Event.removeListener(evt);
			}
		}
		this._evts = [
			PG.Event.bind(this.line,"OnMouseOver",this,this.onPolygonMOver),
			PG.Event.bind(this.line,"OnMouseOut",this,this.onPolygonMOut)];
	};

	/**
		結束標記的編輯狀態
	*/
	PG.EdittingMPolyLine.prototype.endEdit=function()
	{		
		var marker;
		var map=this.line.map;
		while(marker=this.markers.pop())
		{
			map.RemoveEntity(marker.marker,true);
			map.RemoveEntity(marker.midMarker,true);
		}
		map.GetWindowEntity().CloseWindow();
		PG.Event.trigger(this,"editend",[]);
		
		if(this.getPoints().length<(this.isPolygon?3:2))
		{
			map.RemoveEntity(this.line,true);
		}		
		map.RemoveEntity(this.editorPolyLine);//清除編輯時的虛線
		
		var evt;
		if(this._evts){
			while(evt = this._evts.pop()){
				PG.Event.removeListener(evt);
			}
		}
	};

	/**
		克隆所有的點
	*/
	PG.EdittingMPolyLine.prototype.copyPoints=function(points){
		var pts=[];
		for(var i=0;i<points.length;i++){
			pts.push(points[i].Clone());
		}
		return pts;
	};
	
	/**
		銷毀
	*/
	PG.EdittingMPolyLine.prototype.depose = function(){
		this.endEdit();
		this.line.map.RemoveEntity(this.editorPolyLine,true);
	};
	
	/**
		得到編輯點對像
	*/
	PG.EdittingMPolyLine.getIconObj=function(point,offsets,borderColor,bgColor,alpha){
		var divIcon=document.createElement("div");
		PG.Tool.setCssText(divIcon,"border:1px solid "+borderColor+";background:"+bgColor+";line-height:0px;font-size:0px;width:100%;height:100%");
		if(PG.Tool.browserInfo().isIE){
			divIcon.style.filter="alpha(opacity="+alpha*100+")";
		}else{
			divIcon.style.opacity=alpha;
		}
		var postMarker=new PG.MarkEntity(point,new PG.DivIcon(divIcon,new PG.Size(12,12),new PG.Point(offsets[0],offsets[1])));
		return postMarker;
	};

	window.PG.EdittingMPolyLine=PG.EdittingMPolyLine;
}
NPGdittingMPolyLine();