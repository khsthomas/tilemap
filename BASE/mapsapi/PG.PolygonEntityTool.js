/**
	本文件是JS API之中的PG.PolygonTool,PG.PolyLineTool類
	
*/
function MapNSPolygonTool(){

	/**
		測面積工具,用來測量地圖上的面積(多邊形不可交叉),
		同時也可以通過事件來獲取用戶繪製的多邊形,因此也可以作為多邊形繪製工具使用.
		
		map:  地圖對像
		config:	 JS對像,矩形的配置樣式信息,格式為{showLabel:'',intersect:''}
		showLabel 是否顯示面積,如果不顯示面積,則可以作為畫面控件使用,默認值為true.
		intersect 是否允許多邊形交叉,默認值為true,允許相交

	*/
	function PolygonTool(map,config,create)
	{		
		this.config = config?config:{};
		this.lineColor = this.config.LineColor;
		this.fillColor = this.config.FillColor;
		this.lineStroke = this.config.LineStroke;
		this.fillOpacity = this.config.FillOpacity;
		this.lineStyle = this.config.LineStyle;

		this.textOpacity=0.8;
		this.showLabel=(typeof this.config.showLabel=="undefined")?true:!!this.config.showLabel;
		this.intersect=this.config.intersect?true:false;
		if(create){this.create=create;}
		this.create();
		PG.Event.bind(document,"keyup",this,this.onkeyup);
		this.tips="雙擊或右鍵結束";
		this.initialize(map);
		this.cur = [];
		this.autoClear=true;
		this.mapTexts=[];
		this.index=0;
		this.points=[];
		this.polygons=new Array(0);
		
	}
	PG.PolygonTool = PolygonTool;

	/**
		創建	
	*/
	PG.PolygonTool.prototype.create=function()
	{
		this._value = "測面積";
	};

	/**
		開啟繪面工具.
		返回值如果為false,則表明開啟失敗,可能有其他工具正處於開啟狀態.請先關閉其他工具再進行開啟	
		option {"DrawPtEvt":"OnClick","DrawEndEvt":"OnDblClick"}
	*/
	PG.PolygonTool.prototype.Open = function(option){
		if( this.flag )
		{
			if(!this.map.startOccupy(this._value))
			{
				return false;
			}
			this.flag = false;
			var mupevt="OnClick";
			var dblevt="OnDblClick";
			if(option){
				mupevt=!window.PG.isNull(option["DrawPtEvt"])?option["DrawPtEvt"]:mupevt;
				dblevt=!window.PG.isNull(option["DrawEndEvt"])?option["DrawEndEvt"]:dblevt;
			}
			this.mupListener=PG.Event.bind(this.map,mupevt,this,this.onMouseUp);
			//結束事件, 預設是dbclick
			this.dblListener=PG.Event.bind(this.map,dblevt,this,this.onDblclick);
			if(this.cur[0]){
				this.map.SetMapCursor(this.cur[0]);
			}
		}else{
			return false;
		}
	};

	/**
		關閉繪面工具	
	*/
	PG.PolygonTool.prototype.Close = function(){
		if(! this.flag )
		{
			this.map.endOccupy(this._value);
			this.flag=true;
			PG.Event.removeListener(this.mupListener);
			PG.Event.removeListener(this.mmoveListener);
			PG.Event.removeListener(this.dblListener);
			this.mupListener=null;
			this.mmoveListener=null;
//			有一條沒畫完的線
			if(this.points && this.points[this.index]){
				this.delIndex(this.index);
			}
			if(this.autoClear)
			{
				this.clear();
			}
			if(this.lastLine)
			{
				this.map.RemoveEntity(this.lastLine);
				this.lastLine=null;
			}
			if(this.tipText)
			{
				this.map.RemoveEntity(this.tipText);
				this.tipText=null;
			}			
			if(this.cur[1]){
				this.map.SetMapCursor(this.cur[1]);
			}
		}
	};
	/**
		清除所有該控件在地圖上繪製的圖形	
	*/
	PG.PolygonTool.prototype.clear=function()
	{
		var polygon;
		while((polygon=this.polygons.pop())||this.polygons.length>0)
		{
			if(polygon==null){continue;}
			this.map.RemoveEntity(polygon,true);
			this.map.RemoveEntity(polygon.closeBtn,true);
		}
		polygon=null;		
		var maptext,maptexts;
		while((maptexts=this.mapTexts.pop())||this.mapTexts.length>0)
		{
			if(maptexts==null){continue;}
			while(maptext=maptexts.pop())
			{
				this.map.RemoveEntity(maptext);
			}
		}
		maptexts=null;
		maptext=null;
		this.mapTexts=[];
		this.index=0;
		this.points=[];
		this.polygons=new Array(0);
	};

	/**
		當繪製面時,每單擊一下地圖,添加一個點			
	*/
	PG.PolygonTool.prototype.onMouseUp= function(point,button)
	{
		if(button==1)
		{
			this.addPoint(point);
		}
		//滑鼠右鍵,結束
		if(button==2)
		{
			this.addPoint(point);
			this.onDblclick(point,{});
			//PG.Event.trigger(this.map,"OnDblClick",[point,{}]);
		}
	};

	/**
		當雙擊時執行	
	*/
	PG.PolygonTool.prototype.onDblclick = function(point,config){
		config.isStop = true;
		this.EndDraw();
	};

	PG.PolygonTool.prototype.addPoint=function(point)
	{
		var pointLatLng=this.map.fromContainerPixelToLatLng(point);
		if(!this.points[this.index])
		{//如果是新建一個多邊形
			this.points.push([]);
			this.points[this.index].push(pointLatLng);
			var polygon=new PG.PolygonEntity(this.points[this.index],this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity);
			if(this.lineStyle){polygon.SetLineStyle(this.lineStyle);}
			this.polygons.push(polygon);
			this.map.AddEntity(this.polygons[this.index]);
			if(this.showLabel)
			{
				var mapText=new PG.PointEntity(pointLatLng,new PG.Point(2,0));
				mapText.SetFontSize(13);
				mapText.SetText("0&nbsp;km<sup>2</sup>");
				mapText.SetOpacity(this.textOpacity);
				mapText.SetNoWrap(true);
				this.map.AddEntity(mapText);
				this.mapTexts.push([]);
				this.mapTexts[this.index].push(mapText);
			}
			this.lastPoint=pointLatLng;
			if(!this.lastLine)
			{
				this.lastLine=new PG.PolylineEntity([this.points[this.index][0]],this.lineColor,this.lineStroke,this.polygonOpacity);
				if(!this.lineColor){this.lastLine.SetLineColor("#0000ff");}
				this.lastLine.SetLineStyle("Dash");
				if(this.lineStyle){this.lastLine.SetLineStyle(this.lineStyle);}
				this.map.AddEntity(this.lastLine);
			}
			else
			{
				this.lastLine.points[0]=this.points[this.index][0];
			}
			if(!this.tipText)
			{
				this.tipText=new PG.PointEntity(this.points[this.index][0],new PG.Point(10,0));
				this.tipText.SetBackgroundColor("#D2F0FF");
				this.tipText.SetFontSize(13);
				this.tipText.SetOpacity(this.textOpacity);
				this.tipText.SetNoWrap(true);
			}
			this.map.AddEntity(this.tipText);
			this.tipText.SetText(this.tips);
			this.mmoveListener=PG.Event.bind(this.map.container,"mousemove",this,this.onMouseMove);
		}
		else
		{//如果是給多邊形添加點
			if(!this.intersect){
				var last = this.map.fromLatLngToContainerPixel(this.points[this.index][this.points[this.index].length-1 ]);
				if(!(last.x==point.x&&last.y==point.y)){
					if(this.points[this.index].length>=3){
						if(!PG.PolygonTool.checkItst(this.points[this.index],point.x,point.y,this.map)){
							alert("測面積多邊形不能夠相交，請重新選擇位置。");
							return;
						}
					}
				}
			}
			this.points[this.index].push(pointLatLng);
			this.polygons[this.index].SetPoints(this.points[this.index]);
			if(this.showLabel)
			{
				this.mapTexts[this.index][0].setPoint(pointLatLng);
				var area=PG.PolygonTool.GetPointsArea(this.points[this.index]);
				var km2sup = parseInt(area/1000);		
				km2sup /= 1000;
				this.mapTexts[this.index][0].SetText(km2sup+"&nbsp;km<sup>2</sup>");
			}
			this.tipText.setPoint(pointLatLng);
			this.lastPoint=pointLatLng;
		}
	};
	/**
		判斷繪製的多邊形是否相交	

	*/
	PG.PolygonTool.checkItst = function(pots,x,y,map){
		var ptsX = [];
		var ptsY = [];
		for(var i=0;i<pots.length;i++){
			var p = map.fromLatLngToContainerPixel(pots[i]);
			ptsX.push(p.x);
			ptsY.push(p.y);
		}
		var theX = x;
		var theY = y;
		var editPointCount = ptsX.length;
		var tempSideA = 0.0;
		var tempSideB = 0.0;
		var judgeSide = PG.PolygonTool.judgeSide;
		var judgeAngle = PG.PolygonTool.judgeAngle;
		var isIntersectStreak = PG.PolygonTool.isIntersectStreak;

		//判斷是否相交部分,不全放在for循環裡面是為了減少if判斷以提高效率	
		var count=editPointCount-1;
		if(isIntersectStreak(ptsX[0],ptsY[0],ptsX[1],ptsY[1],ptsX[count],ptsY[count],theX, theY))
		{
			return false;
		}		
		for(var i=2; i<count; i++)
		{
			if(isIntersectStreak(ptsX[i-1],ptsY[i-1],ptsX[i],ptsY[i],ptsX[0],ptsY[0],theX, theY)||isIntersectStreak(ptsX[i-1],ptsY[i-1],ptsX[i],ptsY[i],ptsX[count],ptsY[count],theX, theY))
			{
				return false;
			}
		}
		if(isIntersectStreak(ptsX[count-1],ptsY[count-1],ptsX[count],ptsY[count],ptsX[0],ptsY[0],theX, theY))
		{
			return false;
		}
		
		return true;		
	};

	/**
		結束繪製	
	*/
	PG.PolygonTool.prototype.EndDraw=function(type)
	{
		if(!this.points || !this.points[this.index]){return;}
		var map=this.map;
		//因為雙擊結束多點擊了一下,ie和其他的不同
		if(!PG.Tool.browserInfo().isIE){
			this.points[this.index].pop();
			this.polygons[this.index].SetPoints(this.points[this.index]);
		}
		if(this.points[this.index].length==1)
		{
			var mapText;
			if(this.mapTexts[this.index])
			{
				while(mapText=this.mapTexts[this.index].pop())
				{
					map.RemoveEntity(mapText);
				}
			}
			map.RemoveEntity(this.polygons[this.index]);
		}
		this.addCloseClk("polygon");
		this.index++;
		this.lastPoint=null;
		while(this.lastLine.points.pop()){}
		this.lastLine.SetPoints(this.lastLine.points);
		this.map.RemoveEntity(this.tipText);
		PG.Event.removeListener(this.mmoveListener);
		this.mmoveListener=null;
//		如果esc刪除則不觸發draw (PG.Event.trigger,執行註冊 字串的方法)
		if(type!="del")
		PG.Event.trigger(this,"OnDraw",[this.points[this.index-1],PG.PolygonTool.GetPointsArea(this.points[this.index-1]),this.polygons[this.index-1]]);
	};

	/**
		鼠標移動時觸發	
	*/
	PG.PolygonTool.prototype.onMouseMove= function(e)
	{
		if(!this.lastPoint)
		{
			return;
		}
		var p=PG.Tool.getEventPosition(e,this.map.container);
		var lastP=this.map.fromLatLngToContainerPixel(this.lastPoint);
		var point=this.map.fromContainerPixelToLatLng([p[0]+((lastP[0]>p[0])?2:-2),p[1]+((lastP[1]>p[1])?2:-2)]);
		this.lastLine.points[2]=this.lastPoint;
		this.lastLine.points[1]=point;
		this.lastLine.SetPoints(this.lastLine.points);
		this.tipText.SetPoint(point);
	};
		

	/**
		初始化	
	*/
	PG.PolygonTool.prototype.initialize = function( map )
	{
		if(this.map){return false;}
		this.map = map;
		this.flag = true;
	};
	
	/**
		設置繪製時跟隨鼠標的文字提示的內容	
	*/
	PG.PolygonTool.prototype.SetTips = function( v )
	{
		this.tips= v;
	};

	/**
		不知道這個方法幹嘛用的---徐金評	
		應該是設定Cursor吧--Thomas
	*/
	PG.PolygonTool.prototype.setCur = function(ary){
		this.cur[0] = ary[0];
		this.cur[1] = ary[1];
	};

	/**
		計算一系列地理點組成的多邊形面積	
	*/
	PG.PolygonTool.GetPointsArea=function(points)
	{
		var s=0;
		var num=points.length;
		for(var i=1;i<num;i++)
		{
			s+=PG.PolygonTool.getLineSQR(points[i-1],points[i]);
		}
		s+=PG.PolygonTool.getLineSQR(points[num-1],points[0]);
		return Math.abs(s);
	};

	/**
		用於計算一系列地理點組成的多邊形面積
	*/
	PG.PolygonTool.getLineSQR=function(points1,points2)
	{
		return (points2.x-points1.x)*(points2.y+points1.y)/2.0;
	};

	/**
		當按下Esc鍵時執行	
	*/
	PG.PolygonTool.prototype.onkeyup=function(evt)
	{
		if(evt.keyCode==27){
			this.delIndex(this.index);
		}
	};

	/**
			
	*/
	PG.PolygonTool.prototype.delIndex = function(idx){
		if(!this.points[idx]){return;}
		if(idx == this.index){
			this.EndDraw("del");
		}
		var pits = this.points[idx];		this.points[idx] = null;
		var plys = this.polygons[idx];		this.polygons[idx] = null;
		var polay = this.mapTexts[idx];		this.mapTexts[idx] = null;
//		可能被地圖編輯器調用,地圖編輯器會清除頁面的標線
		plys&&this.map.RemoveEntity(plys.closeBtn,true);
		plys&&this.map.RemoveEntity(plys,true);
		if(polay)
			for(var i=0;i<polay.length;i++){
				this.map.RemoveEntity(polay[i],true);
			}
	};

	/**
			
	*/
	PG.PolygonTool.prototype.onCloseClk = function(e,idx){
		this.delIndex(idx);
		//PG.Event.cancelBubble(e);
	};

	/**
		繪製面結束時執行	

	*/
	PG.PolygonTool.prototype.addCloseClk = function(type){
		//		關閉按鈕start
		if(this.points[this.index].length<=1)return;
		var ptls = this.points[this.index].length;
		var s = this.points[this.index][ptls-2];
		var e = this.points[this.index][ptls-1];
		if(!s){s=e;}
		var pos = [s.MercatorLng-e.MercatorLng,s.MercatorLat-e.MercatorLat];
				
		var closediv = document.createElement("div");
		closediv.innerHTML = "<img style='cursor:pointer;position:relative;left: 0px; top: -14px;' src='"+window.PG._IMG_PATH+"polygon/ctrls.gif'>";
		closediv.style.overflow = "hidden";
		closediv.style.position = "relative";
		closediv.style.width = "12px";
		closediv.style.height = "12px";

		var lineLast = this.points[this.index][ptls-1];
		var anchorPer=[1.2,0.5];if(pos[0]<0){anchorPer=[-0.2,0.5];}
		var closeLay = new PG.PointEntity(lineLast,new PG.Point(0,0),anchorPer);
		closeLay.setZindex(700,700);
		closeLay.SetBackgroundColor("");
		closeLay.SetBorderLine(0);
		closeLay.SetText(closediv);
		this.map.AddEntity(closeLay);
		this.polygons[this.index].closeBtn = closeLay;
		if(this.mapTexts[this.index]){
			var ol = this.mapTexts[this.index][this.mapTexts[this.index].length-1];
			if(type=="polygon"){
				ol.SetText("總面積:"+ol.GetObject().innerHTML);
			}else if(type=="polyline"){
				ol.SetText("總長:"+ol.GetObject().innerHTML);
			}
			var y = -20;if(pos[1]>0){y = 20;}
			ol.SetOffset(new PG.Point(0,y));
			ol.SetBorderLine(1);
			ol.SetBackgroundColor("#ffffff");
			ol.SetBorderColor("#ff0000");
			ol.GetObject().style.padding = "3px";
			ol.reDraw(true);
		}
		PG.Event.bind(closediv,"OnClick",this,(function(idx){
				return function(e){
					this.onCloseClk(e,idx)
				}
			})(this.index));
		PG.Event.bind(closediv,"OnMouseUp",this,PG.Event.cancelBubble);
//		關閉按鈕end
	};
	
	/**
		用於判斷繪製的多邊形是否相交	
	*/
	PG.PolygonTool.judgeSide = function(x1, y1, x2, y2, x3, y3)
	{
		x1 -= x3;
		y1 -= y3;
		x2 -= x3;
		y2 -= y3;
		return (x1*y2 - y1*x2);
	};

	/**
		用於判斷繪製的多邊形是否相交	
	*/
	PG.PolygonTool.judgeAngle = function(x1, y1, x2, y2)
	{
		return (x2*y1 - y2*x1);
	};

	/**
		用於判斷繪製的多邊形是否相交	
	*/
	PG.PolygonTool.triangleArea = function(x1,y1,x2,y2,x3,y3){
		return (x1-x3)*(y2-y3)-(y1-y3)*(x2-x3);
	};

	/**
		用於判斷繪製的多邊形是否相交
	*/
	PG.PolygonTool.isIntersectStreak = function(x1,y1,x2,y2,x3,y3,x4,y4){
		var triangleArea = PG.PolygonTool.triangleArea;
		var x0 = 0,y0 = 0;
		if((y2-y1)*(x4-x3)-(y4-y3)*(x2-x1)!=0){
			x0 = x3 + (x4 - x3) * triangleArea(x1,y1,x3,y3,x2,y2)/(triangleArea(x1,y1,x3,y3,x2,y2) + triangleArea(x1,y1,x2,y2,x4,y4));
			y0 = y3 + (y4 - y3) * triangleArea(x1,y1,x3,y3,x2,y2)/(triangleArea(x1,y1,x3,y3,x2,y2) + triangleArea(x1,y1,x2,y2,x4,y4));
			if((x0-x1)*(x0-x2)<=0&&(x0-x3)*(x0-x4)<=0&&(y0-y1)*(y0-y2)<=0&&(y0-y3)*(y0-y4)<=0){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	};
	
	/**
		(PolyLineTool繼承自PolygonTool)
		測距工具,用來測量地圖上的距離
		同時也可以通過事件來獲取用戶繪製的折線,因此也可以作為折線繪製工具使用	
	*/
	function PolyLineTool(map,config)
	{
		var control=new PG.PolygonTool(map,config,PG.PolyLineTool.create);
		//覆寫方法
		control.addPoint=PG.PolyLineTool.addPoint;
		control.EndDraw=PG.PolyLineTool.EndDraw;
		control.onMouseMove=PG.PolyLineTool.onMouseMove;
		return control;
	}
	PG.PolyLineTool = PolyLineTool;

	/**
			創建
	*/
	PG.PolyLineTool.create=function()
	{
		this.div =PG.Tool.createDiv(1,["70%","90%"]);
		this.btn = document.createElement( "input" );
		this.btn.type = "button";
		this.btn.value = "測距離";
		this.div.appendChild( this.btn );
	};

	/**
		添加點	

	*/
	PG.PolyLineTool.addPoint=function(point)
	{
		var pointLatLng=this.map.fromContainerPixelToLatLng(point);
		if(!this.points[this.index])
		{
			this.points.push(new Array(0));
			this.points[this.index].push(pointLatLng);
			if(this.showLabel)
			{
				this.mapTexts.push(new Array(0));
				var mapText=new PG.PointEntity(pointLatLng,new PG.Point(2,0));
				this.mapTexts[this.index].push(mapText);
				mapText.SetFontSize(13);
				mapText.SetText("0&nbsp;m");
				mapText.SetBackgroundColor("#ffffff");
				mapText.SetOpacity(this.textOpacity);
				mapText.SetNoWrap(true);
				this.map.AddEntity(mapText);
			}
			var polyLine=new PG.PolylineEntity(this.points[this.index],this.lineColor,this.lineStroke,this.lineOpacity);
			if(this.lineStyle){polyLine.SetLineStyle(this.lineStyle);}
			if(this.lineArrow){polyLine.SetLineArrow(this.lineArrow);}
			this.polygons.push(polyLine);
			this.map.AddEntity(this.polygons[this.index]);
			this.lastPoint=pointLatLng;
			if(!this.tipText)
			{
				this.tipText=new PG.PointEntity(this.points[this.index][0],new PG.Point(10,0));
				this.tipText.SetBackgroundColor("#D2F0FF");
				this.tipText.SetFontSize(13);
				this.tipText.SetOpacity(this.textOpacity);
				this.tipText.SetNoWrap(true);
			}
			this.map.AddEntity(this.tipText);
			this.tipText.SetText(this.tips);
			this.mmoveListener=PG.Event.bind(this.map.container,"mousemove",this,this.onMouseMove);
		}
		else
		{
			//算各點的距離
			this.points[this.index].push(pointLatLng);
			if(this.showLabel)
			{
				var mapText=new PG.PointEntity(pointLatLng,new PG.Point(2,0));
				this.mapTexts[this.index].push(mapText);
				mapText.SetFontSize(13);
				mapText.SetOpacity(this.textOpacity);
				mapText.SetNoWrap(true);
				mapText.SetBackgroundColor("#ffffff");
				var distance=PG.PolyLineTool.GetPointsDistance(this.points[this.index]);
				var distanceStr;
				if(distance<1000)
				{
					distanceStr=parseInt(distance)+"&nbsp;m";
				}
				else
				{
					distanceStr=(parseInt(distance)/1000)+"&nbsp;km";
				}
				mapText.SetText(distanceStr);
				this.map.AddEntity(mapText);
			}
			this.polygons[this.index].SetPoints(this.points[this.index]);
			this.lastPoint=pointLatLng;
			this.tipText.setPoint(pointLatLng);
		}
	};

	/**
		結束繪製	
	*/
	PG.PolyLineTool.EndDraw=function(type)
	{
		if(!this.points || !this.points[this.index]){return;}
		var map=this.map;
		//因為雙擊結束多點擊了一下,ie和其他瀏覽器對雙擊殘生的事件是不同的
		if(!PG.Tool.browserInfo().isIE){
			this.points[this.index].pop();
			this.polygons[this.index].SetPoints(this.points[this.index]);
			this.mapTexts[this.index]&&this.map.RemoveEntity(this.mapTexts[this.index].pop());
		}
		if(this.points[this.index].length==1)
		{
			if(this.mapTexts[this.index]){
				var mapText;
				while(mapText=this.mapTexts[this.index].pop())
				{
					map.RemoveEntity(mapText);
				}
			}
			map.RemoveEntity(this.polygons[this.index]);
		}
		
		this.addCloseClk("polyline");
		this.index++;
		this.lastPoint=null;
		if(this.lastLine){
			while(this.lastLine.points.pop()){}
			this.lastLine.SetPoints(this.lastLine.points);
		}
		this.map.RemoveEntity(this.tipText);
		PG.Event.removeListener(this.mmoveListener);
		this.mmoveListener=null;
		//如果Esc刪除則不觸發draw
		if(type!="del"){
			var dis=PG.PolyLineTool.GetPointsDistance(this.points[this.index-1]);
			//點位, 長度, polygonEntity
			PG.Event.trigger(this,"OnDraw",[this.points[this.index-1],dis,this.polygons[this.index-1]]);
		}
	};

	/**
		鼠標移動時觸發	
	*/
	PG.PolyLineTool.onMouseMove= function(e)
	{
		if(!this.lastPoint){return;}
		var p=PG.Tool.getEventPosition(e,this.map.container);
		var lastP=this.map.fromLatLngToContainerPixel(this.lastPoint);
		var point=this.map.fromContainerPixelToLatLng([p[0]+((lastP[0]>p[0])?2:-2),p[1]+((lastP[1]>p[1])?2:-2)]);
		if(!this.lastLine)
		{
			this.lastLine=new PG.PolylineEntity([this.lastPoint,point],this.lineColor,this.lineStroke,this.lineOpacity);
			if(!this.lineColor){this.lastLine.SetLineColor("#0000ff");}
			this.lastLine.SetLineStyle("Dash");
			if(this.lineArrow){this.lastLine.SetLineArrow(this.lineArrow[0],this.lineArrow[1]);}
			this.map.AddEntity(this.lastLine);
		}
		this.lastLine.SetPoints([this.lastPoint,point]);
		this.tipText.SetPoint(point);
	};

	/**
		計算一系列地理點的距離總和,實際上就是一條折線的地理長度	
	*/
	PG.PolyLineTool.GetPointsDistance=function(points)
	{
		var s=0;
		for(var i=1;i<points.length;i++)
		{
			s+=PG.Tool.getPointsDistance(points[i-1],points[i]);
		}
		return s;
	};

	window.PG.PolygonTool = PG.PolygonTool;
	window.PG.PolyLineTool=PG.PolyLineTool;
}
MapNSPolygonTool();