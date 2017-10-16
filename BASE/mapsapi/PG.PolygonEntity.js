/**
	本文件是JS API之中的PG.PolygonEntity,PG.PolylineEntity類

*/
function MapNSPolygonEntity()
{
	/**
		面對像

		points		用來繪製多邊形的各頂點數組
		color		表示多邊形的邊框顏色,默認為blue
		bgcolor		表示多邊形的背景填充色,默認為#99FFCC
		weight		表示多邊形的邊框顯示寬度,以像素為單位,默認為3
		opacity		表示多邊形的顯示的透明度,範圍為0-1,越小表示越透明,默認為0.5
	*/
	function PolygonEntity(points,color,bgcolor,weight,opacity,create,polygonType)
	{		
		PG.Tool.inherit(this,PG.Entity);
		PG.Tool.inherit(this,PG.PolygonEntity.prototype);
		this.isie=PG.BrowserInfo.isIE();
		
		this.points=points;
		color=(color || color=="")?color:"#0000FF";
		bgcolor=(bgcolor || bgcolor=="")?bgcolor:"#99FFCC";
		weight=weight?weight:"3px";
		opacity=opacity?opacity:0.45;
		this.lineArrow=["None","None"];

		this.countBounds();
		if(create){this.create=create;}

		this.create();
		this.SetLineColor(color);
		if(polygonType=="polyline"){
			this.type = window.PG.ENTITY_POLYLINE;
			this.SetFillColor("none");
		}else{
			this.type = window.PG.ENTITY_POLYGON;
			this.SetFillColor(bgcolor);
		}
		this.polygonType = polygonType;
		this.SetLineStroke(weight);
		this.SetOpacity(opacity);
		this.SetLineStyle("solid");
		PG.Tool.setZIndex(this.div,420);		
		if(this.isie){
			this.listeners=[
				PG.Event.bind(this.div,"click",this,this.onClick),
				PG.Event.bind(this.div,"mouseover",this,this.onMouseOver),
				PG.Event.bind(this.div,"mousemove",this,this.onMouseMove),
				PG.Event.bind(this.div,"mouseout",this,this.onMouseOut)
			]
		}else{
			this.listeners=[
				PG.Event.bind(this.svgpath,"click",this,this.onClick),
				PG.Event.bind(this.svgpath,"mouseover",this,this.onMouseOver),
				PG.Event.bind(this.svgpath,"mousemove",this,this.onMouseMove),
				PG.Event.bind(this.svgpath,"mouseout",this,this.onMouseOut)
			]
		}
		
	}
	PG.PolygonEntity = PolygonEntity;

	/**
		返回疊加物類型		
	*/
	PG.PolygonEntity.prototype.GetType = function(){	
		return this.type;
	};

	/**
		創建面
		IE下用VML技術,否則用SVG技術
	*/
	PG.PolygonEntity.prototype.create=function()
	{		
		if(this.isie)
		{
			PG.Tool.loadVmlNamespace();
			this.div=document.createElement("v:shape");
			this.div.unselectable="on";
			this.div.filled=true;
			this.stroke=document.createElement("v:stroke");
			this.stroke.joinstyle="round";
			this.stroke.endcap="round";
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.svgNamespace = 'http://www.w3.org/2000/svg';
			this.svgroot = document.createElementNS(this.svgNamespace, "svg");
			this.svgroot.setAttributeNS(null,"style","position: absolute;overflow:visible");
//			屬性overflow:visible   Google和mapbar都有設置,看樣子設置是有用的
			
			var svgpath = document.createElementNS(this.svgNamespace, 'path');
//			svgpath.setAttributeNS(null, 'style', "fill:none;stroke:#FF9933;stroke-width:6;stroke-miterlimit:8;");
//			svgpath.setAttributeNS(null, 'fill', "none");
//			svgpath.setAttributeNS(null, 'stroke', "#FF9933");
//			svgpath.setAttributeNS(null, 'stroke-miterlimit', "8");
//			svgpath.setAttributeNS(null, 'stroke-width', "6");
//			svgpath.setAttributeNS(null, 'stroke-dasharray', "6,8");

			svgpath.setAttributeNS(null, 'stroke-linecap', "round");
			svgpath.setAttributeNS(null, 'stroke-linejoin', "round");
			
			this.svgroot.appendChild(svgpath);
			
//			svgpath.setAttributeNS(null, 'style', "fill:none;stroke:#FF9933;stroke-width:2;stroke-dasharray:10,3,6,9");
			this.div = svgpath;
			this.svgpath=svgpath;
		}
		this.div.style.position="absolute";
	};

	/**
		鼠標移過時觸發 
	*/
	PG.PolygonEntity.prototype.onMouseOver=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnMouseOver",[new PG.Point(point[0],point[1]),e]);
	};

	/**
		鼠標移動時觸發 
	*/
	PG.PolygonEntity.prototype.onMouseMove=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"mousemove",[new PG.Point(point[0],point[1]),e]);
	};
	

	/**
		鼠標移出時觸發 
	*/
	PG.PolygonEntity.prototype.onMouseOut=function(e)
	{
//		刪掉折線也會導致out觸發,不同瀏覽器表現不同
		if(!this.map) return;
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnMouseOut",[new PG.Point(point[0],point[1]),e]);
	};

	/**
		鼠標點擊時觸發 
	*/
	PG.PolygonEntity.prototype.onClick=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnClick",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)]);
	};
	
	/**
		判斷一個經緯度點是否在面範圍之內	
		
		射線判別法

		如果一個點在多邊形內部，任意角度做射線肯定會與多邊形要麼有一個交點，要麼有與多邊形邊界線重疊。
		如果一個點在多邊形外部，任意角度做射線要麼與多邊形有一個交點，要麼有兩個交點，要麼沒有交點，要麼有與多邊形邊界線重疊。
		利用上面的結論，我們只要判斷這個點與多邊形的交點個數，就可以判斷出點與多邊形的位置關係了。

		注意事項:

		l 射線跟多邊形的邊界線重疊的情況
		l 區別內部點和外部點的射線在有一個交點時的情況
		對於第一個注意事項，可以將射線角度設為零度，這樣子只需要判斷兩個相鄰頂點的Y值是否相等即可。然後再判斷這個點的X值方位。
		對於第二個注意事項，網上許多文章都說到做射線以後交點為奇數則表示在多邊形內部，這是一個錯誤的觀點，不僅對於凹多邊形不成立，對於凸多邊形也不成立。

		例如：從外部點做射線剛好經過一頂點，這樣子交點個數就為奇數，但是該點卻不在多邊形內部。
		至於要如何區分這兩種情況，用了一個不完美的方法，外部點的射線跟多邊形有一個交點的時候，該交點肯定為頂點，如果該射線上移一位或者下移一位，要麼變成有兩個交點要麼沒有交點。
		當然為了安全起見，這裡把射線盡量往相鄰點中心移動。這樣子就能夠判斷出是外部點的射線跟多邊形有一個交點。
		不過這個方法並不完美，因為有了移位操作，可能會把內部點移動出外部。而且如果判斷點在(60,30)位置，判斷的時候先遇到(20,30)，然後移位操作，就判斷就出錯了。
		為了解決這些問題，在起初先掃瞄一次判斷點是否在頂點上雖然影響了一點效率，而且當判定點距離多邊形一個單位時，判斷可能會有誤。不過只要不是需要高精度的話，這個方法還是很有效的。
		
		pt  :PG.Point

	*/
	PG.PolygonEntity.prototype.ContainsPoint = function(pt){
		if(!pt){return false;}
		if((pt.type!=window.PG.GEO_POINT)&&(pt.nowrap!=false)){return false;}
		var i,j;
		var inside,redo;
		var polygon = this.points;
		var N = polygon.length;	
		redo = true;
		for(i = 0;i < N;++i)
		{
			if(polygon[i].x == pt.x && polygon[i].y == pt.y )
			{ // 是否在頂點上
				redo = false;
				inside = true;
				break;
			}
		}

		while(redo)
		{
			redo = false;
			inside = false;
			for(i = 0,j = N - 1;i < N;j = i++) 
			{
				if((polygon[i].y < pt.y && pt.y < polygon[j].y)||(polygon[j].y < pt.y && pt.y < polygon[i].y)) 
				{
					if(pt.x <= polygon[i].x || pt.x <= polygon[j].x) 
					{
						var _x = (pt.y-polygon[i].y)*(polygon[j].x-polygon[i].x)/(polygon[j].y-polygon[i].y)+polygon[i].x;
						if(pt.x < _x){inside = !inside;}
						else if(pt.x == _x)   
						{
							inside = true;
							break;
						}
					}
				}
				else if(pt.y == polygon[i].y) 
				{
					if (pt.x < polygon[i].x)   
					{
						if(polygon[i].y > polygon[j].y){--pt.y;}else{++pt.y;}
						redo = true;
						break;
					}
				}
				else if(polygon[i].y == polygon[j].y && pt.y == polygon[i].y&&((polygon[i].x < pt.x && pt.x < polygon[j].x)||(polygon[j].x < pt.x && pt.x < polygon[i].x)))
				{
					inside = true;
					break;
				}
			}
		}
		return inside;
	};

	/**
		取得矩形
	*/
	PG.PolygonEntity.prototype.countBounds=function()
	{
		this.bounds=PG.Rect.GetPointsBounds(this.points);		
	};
	/**
		兼容手机
	*/
	PG.PolygonEntity.prototype.SetNodeSize= function(){
	
	};

	/**
		初始化
	*/
	PG.PolygonEntity.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		if(this.isie){
			this.map.overlaysDiv.appendChild(this.div);
		}else{
			if(!this.map.polygonLayer){
				this.map.polygonLayer = this.svgroot;
				this.map.overlaysDiv.appendChild(this.svgroot);
			}else{
				this.svgroot = this.map.polygonLayer;
			}
			this.map.polygonLayer.appendChild(this.div);
		}
		this.added=true;
		PG.Event.trigger(this,"init",[]);
	};

	/**
		返回所有的點

	*/
	PG.PolygonEntity.prototype.getPointsString=function()
	{
		var pointArray=new Array(0);
		var arrayLength=this.points.length;
		var drawSpanXmin=this.drawSpan.XminMercator;
		var drawSpanYmax=this.drawSpan.YmaxMercator;
		if(drawSpanXmin>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>drawSpanYmax){return "";}
		//以下for語句對每一個點進行遍歷
		if(this.isie){//IE
			for(var i=0;i<arrayLength;i++)
			{
				if(i==0){pointArray.push("m");}else{pointArray.push("l");}				
				pointArray.push(parseInt(this.points[i].MercatorLng-drawSpanXmin));
				pointArray.push(parseInt(-this.points[i].MercatorLat+drawSpanYmax));				
			}
			pointArray.push("x");
			pointArray.push("e");
		}else{//非IE
			var maxPixel=this.map.maxPixel;
			for(var i=0;i<arrayLength;i++)
			{
				if(i==0){pointArray.push("M");}else{pointArray.push("L");}
				if(this.map){//轉成像素坐標系					
					var offsetMapPosition=this.map.GetRelativeXY(this.points[i]);
					pointArray.push(offsetMapPosition[0]+maxPixel);
					pointArray.push(offsetMapPosition[1]+maxPixel);
				}
			}
			pointArray.push("Z");
		}
				
		return pointArray.join(" ");
	};

	/**
		重新繪製
	*/
	PG.PolygonEntity.prototype.reDraw=function(flag)
	{
		var bounds=this.map.getBoundsLatLng();
		if(!flag && this.drawBounds && this.drawBounds.IsInclude(bounds)){return;}
		this.drawBounds=this.map.getDrawBounds();
		this.drawSpan=new PG.Rect(Math.max(this.drawBounds.left,this.bounds.left),Math.min(this.drawBounds.top,this.bounds.top),Math.min(this.drawBounds.right,this.bounds.right),Math.max(this.drawBounds.bottom,this.bounds.bottom),false);
		if(this.drawSpan.XminMercator>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>this.drawSpan.YmaxMercator)
		{
			if(this.added)
			{
				if(this.isie){
					this.map.overlaysDiv.removeChild(this.div);
				}else{
					this.svgroot.removeChild(this.div);
				}
				this.added=false;
			}
			this.expandDrawBounds();
			return;
		}
		else if(!this.added)
		{
			if(this.isie){
				this.map.overlaysDiv.appendChild(this.div);
			}else{
				this.svgroot.appendChild(this.div);
			}
			this.added=true;
		}	
		var position=this.map.GetRelativeXY(new PG.Point(this.drawSpan.left,this.drawSpan.top,false));
		if(this.isie)
		{
			PG.Tool.setPosition(this.div,position);
			var zu = this.map.getZoomUnits(this.map.GetZoomLevel(),true);
			PG.Tool.SetSize(this.div,[parseInt((this.drawSpan.XmaxMercator-this.drawSpan.XminMercator)/zu[0]),parseInt((this.drawSpan.YmaxMercator-this.drawSpan.YminMercator)/zu[1])]);
			
			//為什麼要重新設置一遍,主要是IE的VML在被remove之後,有些屬性就會丟失了
			this.SetLineColor(this.color);
			this.SetFillColor(this.bgcolor);
			this.SetLineStroke(this.weight);
			this.SetOpacity(this.opacity);
			this.SetLineStyle(this.lineStyle);
			this.div.path=this.getPointsString();
			this.div.coordsize=(this.drawSpan.XmaxMercator-this.drawSpan.XminMercator)+","+(this.drawSpan.YmaxMercator-this.drawSpan.YminMercator);
		}
		else
		{
			
//		防止svg裡顯示不出完整的線 (webkit內核bug1)
//		防止svg有殘影	(webkit內核bug2)
			var offsetXy=[this.map.maxPixel*2,this.map.maxPixel*2];
			PG.Tool.setPosition(this.svgroot,[-offsetXy[0]/2,-offsetXy[1]/2]);
			var sizeWidth=offsetXy[0];
			var sizeHeight=offsetXy[1];
//			PG.Tool.SetSize(this.svgroot,[sizeWidth,sizeHeight]);
			this.svgroot.setAttributeNS(null,"width",sizeWidth);
			this.svgroot.setAttributeNS(null,"height",sizeHeight);
			
//			注意safari和chrome有bug   viewBox起始不能設置成負值(當設置opacity的情況下)
			this.svgroot.setAttributeNS(null,"viewBox","0 0"+" "+sizeWidth+" "+sizeHeight);
			this.SetLineStroke(this.weight);
			this.svgpath.setAttributeNS(null,"d",this.getPointsString());
//					var pathStr="M 0 0"
//					+" L 0 50"
//					+" L 50 50"
//					+" L 0 0"
//			this.svgpath.setAttributeNS(null,"d",pathStr);
			
		}
		this.expandDrawBounds();
	};

	/**
		擴展繪製範圍
	*/
	PG.PolygonEntity.prototype.expandDrawBounds=function()
	{
		var b = window.PG.LEGALLNGLATBOUNDS;
		if(this.bounds.XmaxMercator<this.drawBounds.XmaxMercator)
		{
			this.drawBounds.SetRight(b[1]);
		}
		if(this.bounds.YmaxMercator<this.drawBounds.YmaxMercator)
		{
			this.drawBounds.SetTop(b[3]);
		}
		if(this.bounds.XminMercator>this.drawBounds.XminMercator)
		{
			this.drawBounds.SetLeft(b[0]);
		}
		if(this.bounds.YminMercator>this.drawBounds.YminMercator)
		{
			this.drawBounds.SetBottom(b[2]);
		}
	};

	/**
		返回容器對像
	*/
	PG.PolygonEntity.prototype.GetObject=function(){
		if(this.isie){
			return this.div;
		}else{
			return null;
		}
	};

	/**
		刪除
	*/
	PG.PolygonEntity.prototype.remove=function()
	{
		if(!this.isie){
			if(this.div.parentNode){
				this.svgroot.removeChild(this.div);
			}
		}
		this.added=false;
		this.map=null;
	};

	/**
		銷毀
	*/
	PG.PolygonEntity.prototype.depose=function()
	{
		var listener;
		while(listener=this.listeners.pop())
		{
			PG.Event.removeListener(listener);
		}
//		if(!document.all)
//		{
//			this.graphics.clear();
//			this.graphics=null;
//		}
		PG.Event.deposeNode(this.div);
		this.svgroot = null;
		this.div=null;
		this.stroke=null;
		this.points=null;
		this.DisableEdit();
	};

	/**
		獲取多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.GetLineColor=function()
	{
		return this.color;
	};

	/**
		獲取多邊形的邊框線寬
	*/
	PG.PolygonEntity.prototype.GetLineStroke=function()
	{
		return this.weight;
	};

	/**
		返回創建此面的經緯度數組
	*/
	PG.PolygonEntity.prototype.getPoints=function()
	{
		return this.points;
	};

	/**
		返回創建此面的經緯度數組
	*/
	PG.PolygonEntity.prototype.GetPoints = function(){
		return this.getPoints();
	};

	/**
		設置多邊形的頂點數組
	*/
	PG.PolygonEntity.prototype.SetPoints = function(lls){
		this.setPoints(lls);
	};

	/**
		設置多邊形的頂點數組
	*/
	PG.PolygonEntity.prototype.setPoints=function(points)
	{
		this.points=points;
		this.countBounds();
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.GetLineColor=function()
	{
		return this.color;
	};

	/**
		設置多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.SetLineColor=function(color)
	{
		this.color=color;
		if(this.isie)
		{
			if(this.color=="transparent" || this.color=="")
			{
				this.div.stroked=false;
			}
			else
			{
				this.div.stroked=true;
				this.div.strokecolor=this.color;
			}
		}
		else
		{
//			this.svgpath.setAttributeNS(null, 'stroke', this.color);
			this.svgpath.setAttribute( 'stroke', this.color);
//			為了解決safari下一個難纏的bug
			if(this.map){
				var offsetXy=[this.map.maxPixel*2,this.map.maxPixel*2];
				var sizeWidth=offsetXy[0];
				var sizeHeight=offsetXy[1];
				this.svgroot.setAttributeNS(null,"width",sizeWidth);
				this.svgroot.setAttributeNS(null,"height",sizeHeight);
			}
//			this.svgpath.style.stroke = this.color;
//			none等價於this.div.stroked=false
		}
	};

	/**
		獲取多邊形的背景填充色
	*/
	PG.PolygonEntity.prototype.GetFillColor=function()
	{
		return this.bgcolor;
	};

	/**
		設置多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.SetFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		if(this.isie)
		{
			if(this.bgcolor=="transparent" || this.bgcolor=="")
			{
				this.div.filled=false;
			}
			else
			{
				this.div.filled=true;
				this.div.fillcolor=this.bgcolor;
			}
		}
		else
		{
			this.svgpath.setAttributeNS(null, 'fill', this.bgcolor);
//			none等價於this.div.filled=false    (透明本質是應該響應事件的,none可能不會響應事件)
		}
	};

	/**
		獲取多面形的顯示不透明度
	*/
	PG.PolygonEntity.prototype.GetOpacity=function()
	{
		return this.opacity;
	};

	/**
		設置多面形的顯示不透明度
	*/
	PG.PolygonEntity.prototype.SetOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(this.isie)
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			PG.Tool.setOpacity(this.svgpath,this.opacity);
			this.svgpath.setAttributeNS(null, 'fill-opacity', this.opacity);
		}
	};

	/**
		獲取多邊形的邊框線寬
	*/
	PG.PolygonEntity.prototype.GetLineStroke=function()
	{
		return this.weight;
	};

	/**
		設置多邊形的邊框線寬
	*/
	PG.PolygonEntity.prototype.SetLineStroke=function(weight)
	{
		this.weight=weight;
		if(this.isie)
		{
			this.div.strokeweight=this.weight;
		}
		else
		{
			this.svgpath.setAttributeNS(null, 'stroke-width', this.weight);
		}
	};

	/**
		獲取多邊形的邊框線型
	*/
	PG.PolygonEntity.prototype.GetLineStyle=function(style)
	{
		return this.lineStyle;
	};

	/**
		設置多邊形的邊框線型

		線型類型有:
		Solid(實線,默認值),ShortDash(虛線),ShortDot(點線),ShortDashDot(點劃線)
		ShortDashDotDot,Dot,Dash,LongDash,DashDot,LongDashDot,LongDashDotDot.

		此方法只在IE瀏覽器中有效.(其他瀏覽器下虛線樣式只有一種,除過solid外,其餘值均可產生虛線效果.)
	*/
	PG.PolygonEntity.prototype.SetLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(this.isie)
		{
			this.stroke.dashstyle=style;
		}else{
//			雖然svg不支持vml的那些亂七八糟的樣式,不過比vml的更加靈活
//			vml的線型可以全部支持,不過暫時只分虛線和實線吧...
			if(style=="solid"){
				this.svgpath.setAttributeNS(null, 'stroke-dasharray', "");
			}else{
				this.svgpath.setAttributeNS(null, 'stroke-dasharray', "6,8");
			}
		}
	};

	/**
		返回線兩端的形狀
	*/
	PG.PolygonEntity.prototype.GetLineArrow=function()
	{
		return this.lineArrow;
	};

	/**
		設置返回線兩端的形狀
	*/
	PG.PolygonEntity.prototype.SetLineArrow=function(start,end)
	{
		if(!end && typeof(start)=="object"){
			end=start[1];
			start=start[0];
		}		
		if(this.isie)
		{
			if(start){this.stroke.startarrow=start};
			if(end){this.stroke.endarrow=end};
		}else{
			if(start){this.lineArrow[0]=start;}
			if(end){this.lineArrow[1]=end;}
		}
	};

	/**
		啟動編輯
	*/
	PG.PolygonEntity.prototype.EnableEdit = function(){
		if(!this.editting){
			this.editting = new PG.EdittingMPolyLine(this,this.polygonType!="polyline");
		}		
		if(!this.added){
			this.onInitL = PG.Event.bind(this,"init",this,function(){
				this.editting.startEdit();
				PG.Event.removeListener(this.onInitL);
				this.onInitL = null;
			});
		}else{
			this.editting.startEdit();
		}
		this.isEdtIng = true;

		//回調函數 徐金評添加2012-6-20
		if(this.onChangeCallback){
			this.onChangeEvent = PG.Event.addListener(this.editting,"change",this.onChangeCallback);
			this.editting._evts.push(this.onChangeEvent);
		}
		if(this.onEditEndCallback){
			this.onEditEndEvent = PG.Event.addListener(this.editting,"editend",this.onEditEndCallback);
			this.editting._evts.push(this.onEditEndEvent);
		}
	};

	/**
		禁止編輯
	*/
	PG.PolygonEntity.prototype.DisableEdit = function(dps){
		if(this.editting){
			this.editting.depose();
			this.editting = null;			
		}
		this.isEdtIng = false;		
	};

	/**
		編輯 ---- 改變線面時觸發的回調方法
	*/
	PG.PolygonEntity.prototype.OnChange = function(callback){
		if(callback){
			this.onChangeCallback = callback;
			if(this.isEdtIng){
				this.onChangeEvent = PG.Event.addListener(this.editting,"change",this.onChangeCallback);
				this.editting._evts.push(this.onChangeEvent);
			}
		}
	};

	/**
		結束編輯線面時觸發的回調方法
	*/
	PG.PolygonEntity.prototype.OnEditEnd = function(callback){
		if(callback){
			this.onEditEndCallback = callback;
			if(this.isEdtIng){
				this.onEditEndEvent = PG.Event.addListener(this.editting,"editend",this.onEditEndCallback);
				this.editting._evts.push(this.onEditEndEvent);
			}
		}
	};

	/**
		是否可編輯 
	*/
	PG.PolygonEntity.prototype.IsEditable = function(){
		return !!this.isEdtIng;
	};

	/**
		線對像
	*/
	function PolylineEntity(points,color,weight,opacity)
	{
		return new PG.PolygonEntity(points,color,"",weight,opacity,PG.PolylineEntity.create,"polyline");
	}
	PG.PolylineEntity = PolylineEntity;

	/**
		創建線對像
	*/
	PG.PolylineEntity.create=function()
	{//this.isie在PG.PolygonEntity設置
		if(this.isie)
		{
			PG.Tool.loadVmlNamespace();
			this.div=document.createElement("v:shape");
			this.div.style.position="absolute";
			this.div.unselectable="on";
			this.div.filled=false;
			this.stroke=document.createElement("v:stroke");
			this.stroke.joinstyle="round";
			this.stroke.endcap="round";
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
			this.div.appendChild(this.stroke);
		}
		else
		{
			this.svgNamespace = 'http://www.w3.org/2000/svg';			
			this.svgroot = document.createElementNS(this.svgNamespace, "svg");
			this.svgroot.setAttributeNS(null,"style","position: absolute;overflow:visible");
			var svgMarker= document.createElementNS(this.svgNamespace, "marker");
			this.svgroot.appendChild(svgMarker);
			var markerPath=document.createElementNS(this.svgNamespace, 'path');
			var markerD="M 0 0 L 1 1";
			markerPath.setAttributeNS(null,"d",markerD);
			svgMarker.appendChild(markerPath);
			
			//避免webkit內核瀏覽器的bug			
			var svgpath = document.createElementNS(this.svgNamespace, 'path');
			svgpath.setAttributeNS(null, 'fill', "none");

			svgpath.setAttributeNS(null, 'stroke-linecap', "round");
			svgpath.setAttributeNS(null, 'stroke-linejoin', "round");
			
			this.svgroot.appendChild(svgpath);			
			
			this.div = svgpath;
			this.svgpath=svgpath;
		}
		this.div.style.position="absolute";
		this.getPointsString=PG.PolylineEntity.getPointsString;
	};

	/**
		返回所有的點

	*/
	PG.PolylineEntity.getPointsString=function()
	{
		var pointArray=new Array(0);
		var arrayLength=this.points.length;
		var zu = this.map.getZoomUnits(this.map.GetZoomLevel(),true);
		var units=[zu[0]*4,zu[1]*4];
		var drawSpanXmin=this.drawSpan.XminMercator;
		var drawSpanYmax=this.drawSpan.YmaxMercator;
		if(drawSpanXmin>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>drawSpanYmax){return "";}
		var flag=-1;
		//以下for語句對每一個點進行遍歷,編寫出該條折線在this.drawBounds範圍中的畫筆代碼,
		//flag總是代表上一個this.drawBounds範圍中的點的索引
		var lastPoint=null;				
		if(this.isie){
			var handle=function(array,p,d){
				array.push(d);
				array.push(parseInt(p.MercatorLng-drawSpanXmin));
				array.push(parseInt(-p.MercatorLat+drawSpanYmax));
			};
			for(var i=0;i<arrayLength;i++)
			{
				if(this.drawBounds.ContainsPoint(this.points[i]))
				{//如果當前點在this.drawBounds範圍中
					if(i==0)
					{//如果是整條折線中第一個在this.drawBounds範圍中的點,則該點作為起點,將畫筆移動到當前點
						handle(pointArray,this.points[i],"m");
						lastPoint=this.points[i];
					}
					else if(flag==i-1)
					{//如果上一個點也在this.drawBounds範圍中,則直接劃線至當前點
						if(arrayLength-1==i || Math.abs(lastPoint.MercatorLng-this.points[i].MercatorLng)>units[0] || Math.abs(lastPoint.MercatorLat-this.points[i].MercatorLat)>units[1])
						{
							handle(pointArray,this.points[i],"l");
							lastPoint=this.points[i];
						}
					}
					else
					{//上一個點不在this.drawBounds範圍之中,應該將畫筆移動到[上一個點和當前點的線段與this.drawBounds的交點],然後再劃線至當前點
						var intersection=this.drawBounds.GetIntersection(this.points[i-1],this.points[i]);
						if(intersection.length==1){
							handle(pointArray,intersection[0],"m");
							handle(pointArray,this.points[i],"l");
						}
						lastPoint=this.points[i];
					}
					flag=i;
				}
				else
				{//如果當前點不在this.drawBounds範圍中
					if(i==0){}
					else if(flag==i-1){//如果上一個點在this.drawBounds範圍中,則應該將畫筆劃線至[上一個點和當前點的線段與this.drawBounds的交點]
						var intersection=this.drawBounds.GetIntersection(this.points[i-1],this.points[i]);
						if(intersection.length==1){handle(pointArray,intersection[0],"l");}
					}else{//如果上一個點也不在this.drawBounds範圍中,為了防止出現斷線情況,應該求取[上一個點和當前點的線段與this.drawBounds的交點],如果存在兩個交點,則移動到第一個交點,劃線至第二個交點
						var intersection=this.drawBounds.GetIntersection(this.points[i-1],this.points[i]);
						if(intersection.length==2){//假如存在兩個交點
							handle(pointArray,intersection[0],"m");
							handle(pointArray,intersection[1],"l");
						}
					}
				}
			}
			pointArray.push("e");
		}else{//非ie			
			var map=this.map;
			var handle=function(array,p,d){array.push(d);};
			if(map){
				var maxPixel=this.map.maxPixel;
				handle=function(array,p,d){
					array.push(d);					
					var offsetMapPosition=map.GetRelativeXY(p);//轉成像素坐標系	
					array.push(offsetMapPosition[0]+maxPixel);
					array.push(offsetMapPosition[1]+maxPixel);
				};	
			}
			for(var i=0;i<arrayLength;i++)
			{
				if(this.drawBounds.ContainsPoint(this.points[i]))
				{//如果當前點在this.drawBounds範圍中
					if(i==0){//如果是整條折線中第一個在this.drawBounds範圍中的點,則該點作為起點,將畫筆移動到當前點
						handle(pointArray,this.points[i],"M");
						lastPoint=this.points[i];
					}
					else if(flag==i-1)
					{//如果上一個點也在this.drawBounds範圍中,則直接劃線至當前點
						if(arrayLength-1==i || Math.abs(lastPoint.MercatorLng-this.points[i].MercatorLng)>units[0] || Math.abs(lastPoint.MercatorLat-this.points[i].MercatorLat)>units[1])
						{							
							handle(pointArray,this.points[i],"L");
							lastPoint=this.points[i];
						}
					}
					else
					{//上一個點不在this.drawBounds範圍之中,應該將畫筆移動到[上一個點和當前點的線段與this.drawBounds的交點],然後再劃線至當前點
						var intersection=this.drawBounds.GetIntersection(this.points[i-1],this.points[i]);
						if(intersection.length==1){									
							handle(pointArray,intersection[0],"M");
							handle(pointArray,this.points[i],"L");
						}
						lastPoint=this.points[i];
					}
					flag=i;
				}
				else
				{//如果當前點不在this.drawBounds範圍中
					if(i==0){}
					else if(flag==i-1)
					{//如果上一個點在this.drawBounds範圍中,則應該將畫筆劃線至[上一個點和當前點的線段與this.drawBounds的交點]
						var intersection=this.drawBounds.GetIntersection(this.points[i-1],this.points[i]);
						if(intersection.length==1){handle(pointArray,intersection[0],"L");}
					}else{//如果上一個點也不在this.drawBounds範圍中,為了防止出現斷線情況,應該求取[上一個點和當前點的線段與this.drawBounds的交點],如果存在兩個交點,則移動到第一個交點,劃線至第二個交點
						var intersection=this.drawBounds.GetIntersection(this.points[i-1],this.points[i]);
						if(intersection.length==2){//假如存在兩個交點							
							handle(pointArray,intersection[0],"M");
							handle(pointArray,intersection[0],"L");

						}
					}
				}
			}
		}		
		return pointArray.join(" ");
	};

	window.PG.PolygonEntity=PG.PolygonEntity;
	window.PG.PolylineEntity=PG.PolylineEntity;
}
MapNSPolygonEntity();