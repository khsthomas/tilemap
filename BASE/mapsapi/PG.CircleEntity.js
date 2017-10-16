/**
	本文件是JS API之中的PG.CircleEntity類

*/
function NSCircleEntity()
{
	
	/**
		疊加層圓對像

		center:	PG.LngLat
		radius:	半徑(米)

		config:	圓的配置樣式信息對像
		格式為{lineColor:'',fillColor:'',lineStroke:'',fillOpacity:'',lineStyle:''}

		lineColor	線條顏色
		fillColor	背景顏色
		lineStroke	線條寬度
		fillOpacity	不透明度 0-1
		lineStyle 線型

		當opacity不為1時,color在IE下會出現不均勻情況...
	*/
	function CircleEntity(center,radius,config)
	{
		this.center=center;
		this.radius=radius;
		this.isie=PG.BrowserInfo.isIE();
		this.color="#FF0000";
		this.bgcolor="#99FFCC";
		this.weight=1;
		this.opacity=0.5;
		this.lineStyle="solid";
		if(config){
			this.color=(config.LineColor||config.LineColor=="")?config.LineColor:"blue";
		    this.bgcolor=(config.FillColor||config.FillColor=="")?config.FillColor:"#99FFCC";
			this.weight=(config.LineStroke||config.LineStroke==0)?config.LineStroke:1;
			this.opacity=(config.FillOpacity||config.FillOpacity==0)?config.FillOpacity:0.5;
			this.lineStyle=config.LineStyle||"solid";
		}		
		this.type = window.PG.ENTITY_CIRCLE;
		this.create();
		this.SetLineStroke(this.weight);
		this.SetLineColor(this.color);
		this.SetOpacity(this.opacity);
		this.SetFillColor(this.bgcolor);
		this.SetLineStyle(this.lineStyle);
		PG.Tool.setZIndex(this.div,420);
		this.edtImgSize=window.PG._circle_edt_imgSize;
		this.edtImgPath=window.PG._circle_edt_imgPath;
		var th = this;
		//延遲1秒待瀏覽器繪製之後添加註冊事件,否則在IE下調用設置屬性的方法會沒效果
		setTimeout(function(){
			PG.Event.bind(th.div,"click",th,th.onClick);
			PG.Event.bind(th.div,"mouseover",th,th.onMouseOver);
			PG.Event.bind(th.div,"mouseout",th,th.onMouseOut);
		},1000);
		
	}
	PG.CircleEntity = CircleEntity;


	/**
		返回疊加物類型		
	*/
	PG.CircleEntity.prototype.GetType = function(){	
		return this.type;
	};

	/**
		創建容器		
	*/
	PG.CircleEntity.prototype.create=function()
	{
		if(this.isie)
		{
			PG.Tool.loadVmlNamespace();
			this.div=document.createElement("v:Oval");
			this.div.unselectable="on";
			this.div.filled=true;
			this.div.stroked=true;
			this.div.strokecolor=this.color;
			this.div.strokeweight=this.weight;
			this.div.fillcolor=this.bgcolor;
			this.stroke=document.createElement("v:stroke");
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.svgNamespace = 'http://www.w3.org/2000/svg';
			this.svgroot = document.createElementNS(this.svgNamespace, "svg");
			this.svgroot.setAttributeNS(null,"style","position: absolute;overflow:visible");			
			var svgpath = document.createElementNS(this.svgNamespace, 'circle');		
			this.svgroot.appendChild(svgpath);			
			this.div = svgpath;
			this.svgpath=svgpath;
		}
		this.div.style.position="absolute";
	};

	/**
		返回圓面積(平方米)		
	*/
	PG.CircleEntity.prototype.GetArea = function(){	
		return Math.PI*Math.pow(this.radius,2);
	};

	/**
		鼠標移過時觸發		
	*/
	PG.CircleEntity.prototype.onMouseOver=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnMouseOver",[new PG.Point(point[0],point[1])]);
	};

	/**
		鼠標移出時觸發			
	*/
	PG.CircleEntity.prototype.onMouseOut=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(new PG.Point(point[0],point[1]),"OnMouseOut",[new PG.Point(point[0],point[1])]);
	};

	/**
		鼠標點擊時觸發				
	*/
	PG.CircleEntity.prototype.onClick=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnClick",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)]);
	};

	/**
		初始化				
	*/
	PG.CircleEntity.prototype.initialize=function(map)
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
		重新繪製	
	*/
	PG.CircleEntity.prototype.reDraw=function(flag)
	{		
		//如果不是必須重繪,則不重繪,大部分的標注都不需要每次重繪
		if(!flag){return;}			
		this.draw(this.map.GetRelativeXY(this.center),this.radius);
		
	};

	/**
		繪製			
	*/
	PG.CircleEntity.prototype.draw=function(center,radius)
	{		
		var scale = this.map.GetScale();
		var r = parseInt(radius/scale);
		if(this.isie)
		{
			var d = 2*r;//直徑
			PG.Tool.setPosition(this.div,[center[0]-r,center[1]-r]);
			PG.Tool.SetSize(this.div,[d,d]);
		}
		else
		{
			
//		防止svg裡顯示不出完整的線 (webkit內核bug1)
//		防止svg有殘影	(webkit內核bug2)
			var offsetXy=[this.map.maxPixel*2,this.map.maxPixel*2];
			PG.Tool.setPosition(this.svgroot,[-offsetXy[0]/2,-offsetXy[1]/2]);
			var sizeWidth=offsetXy[0];
			var sizeHeight=offsetXy[1];
			this.svgroot.setAttributeNS(null,"width",sizeWidth);
			this.svgroot.setAttributeNS(null,"height",sizeHeight);
			
//			注意safari和chrome有bug   viewBox起始不能設置成負值(當設置opacity的情況下)
			this.svgroot.setAttributeNS(null,"viewBox","0 0"+" "+sizeWidth+" "+sizeHeight);
			this.svgpath.setAttributeNS(null, 'cx', center[0] + this.map.maxPixel);
			this.svgpath.setAttributeNS(null, 'cy', center[1] + this.map.maxPixel);
			this.svgpath.setAttributeNS(null, 'r', r);
			this.svgpath.setAttributeNS(null, 'style', 'fill:'+this.bgcolor+';stroke:'+this.color+';stroke-width:'+this.weight);
		}
	};

	/**
		返回容器			
	*/
	PG.CircleEntity.prototype.GetObject=function(){
		if(this.isie){
			return this.div;
		}else{
			return null;
		}
	};

	/**
		刪除	
		此段代碼解決IE下能自動移除,而其他瀏覽器需要調用removeChild方法移除
	*/
	PG.CircleEntity.prototype.remove=function()
	{
		if(!this.isie){
			if(this.div.parentNode){
				if(this.svgroot)this.svgroot.removeChild(this.div);
			}
		}			
		if(this.radiusDot||this.centerDot){
			this.map.RemoveEntity(this.radiusDot);
			this.map.RemoveEntity(this.centerDot);
			this.radiusDot=null;
			this.centerDot=null;
		}
		this.map=null;
	};

	/**
		銷毀 			
	*/
	PG.CircleEntity.prototype.depose=function()
	{
		if(this.graphics)
		{
			this.graphics.clear(); 
			this.graphics=null;
		}
		PG.Event.deposeNode(this.div);
		this.div=null;
		this.center=null;
	};

	/**
		返回此圓的中心點 			
	*/
	PG.CircleEntity.prototype.GetCenter=function()
	{
		return this.center;
	};

	/**
		設置此圓的中心點 
	*/
	PG.CircleEntity.prototype.SetCenter=function(center,radius)
	{
		this.center=center;
		if(radius){this.radius = radius;}
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		返回此圓的半徑 			
	*/
	PG.CircleEntity.prototype.GetRadius=function()
	{
		return this.radius;
	};

	/**
		設置此圓的半徑(米) 
	*/
	PG.CircleEntity.prototype.SetRadius=function(radius)
	{
		this.radius = radius;
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取圓圖形的邊框顏色		
	*/
	PG.CircleEntity.prototype.GetLineColor=function()
	{
		return this.color;
	};

	/**
		設置圓圖形的邊框顏色
	*/
	PG.CircleEntity.prototype.SetLineColor=function(color)
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
			this.svgpath.style.stroke=this.color;
		}
	};

	/**
		獲取圓圖形的背景填充色
	*/
	PG.CircleEntity.prototype.GetFillColor=function()
	{
		return this.bgcolor;
	};

	/**
		設置圓圖形的背景填充色
	*/
	PG.CircleEntity.prototype.SetFillColor=function(bgcolor)
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
			this.svgpath.style.fill=this.bgcolor;
		}
	};

	/**
		獲取圓透明度
	*/
	PG.CircleEntity.prototype.GetOpacity=function()
	{
		return this.opacity;
	};

	/**
		設置圓透明度
	*/
	PG.CircleEntity.prototype.SetOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(this.isie)
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			this.svgpath.setAttributeNS(null, 'opacity', this.opacity);
		}
	};

	/**
		獲取圓圖形的邊框線寬
	*/
	PG.CircleEntity.prototype.GetLineStroke=function()
	{
		return this.weight;
	};

	/**
		設置圓圖形的邊框線寬
	*/
	PG.CircleEntity.prototype.SetLineStroke=function(weight)
	{		
		this.weight=weight;		
		if(this.isie)
		{
			this.div.strokeweight=this.weight;
		}
		else
		{
			this.svgpath.style.strokeWidth=this.weight;
		}
	};

	/**
		獲取圓圖形的邊框線型
	*/
	PG.CircleEntity.prototype.GetLineStyle=function(style)
	{
		return this.lineStyle;
	};

	/**
		設置邊框的顯示線型---只在IE有效
		有以下幾種類型:Solid(實線,默認值),Dot(點線),Dash(折線)
	*/
	PG.CircleEntity.prototype.SetLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(this.isie)
		{
			this.stroke.dashstyle=style;
		}
	};

	/**
		啟動編輯功能
	*/
	PG.CircleEntity.prototype.EnableEdit = function(){
		this._eEdit = true;
		if(!this.map){
			this.onInitL = PG.Event.bind(this,"init",this,function(){
				this.startDrag();
				PG.Event.removeListener(this.onInitL);
				this.onInitL = null;
			});
		}else{
			this.startDrag();
		}		
	};

	/**
		禁止編輯功能
	*/
	PG.CircleEntity.prototype.DisableEdit = function(){
		this._eEdit = false;
		if(this.onInitL){
			PG.Event.removeListener(this.onInitL);
			this.onInitL = null;
		}
		this.endEdit();
	};

	/**
		是否啟動編輯功能
	*/
	PG.CircleEntity.prototype.IsEditable = function(){
		return !!this._eEdit;
	};

	/**
		開始拖動

		圓編輯有兩種情況:
		1,拖動編輯點
		2,拖動整個圓
		對這兩種情況分別綁定函數進行處理
	*/
	PG.CircleEntity.prototype.startDrag = function(){

		if(!this.listeners){this.listeners = [];}				
		this.createDragDot();
		this.radiusDot.EnableEdit();
		this.centerDot.EnableEdit();		
		var circle = this;
		var radiusDotListener = PG.Event.addListener(this.radiusDot,'OnDrag',function(lnglat){
			var dis =PG.Tool.getPointsDistance(circle.center,lnglat);
			circle.SetRadius(dis);
			var p = circle.calRadiusDragDot();
			circle.radiusDot.SetPoint(new PG.Point(p.x,circle.center.y,false));			
			circle.onDrag();
		});

		var centerDotListener = PG.Event.addListener(this.centerDot,'OnDrag',function(lnglat){
			circle.SetCenter(lnglat,circle.radius);
			circle.radiusDot.SetPoint(circle.calRadiusDragDot());
			circle.onDrag();			
		});

		var radiusDotUp = PG.Event.addListener(this.radiusDot,'OnMouseUp',function(lnglat){
				circle.onEndEdit();	
		});

		var centerDotUp = PG.Event.addListener(this.centerDot,'OnMouseUp',function(lnglat){
				circle.onEndEdit();			
		});
		
		this.listeners.push(radiusDotListener);
		this.listeners.push(centerDotListener);
		this.listeners.push(radiusDotUp);
		this.listeners.push(centerDotUp);
	};

	/**
		鼠標拖動時觸發			
	*/
	PG.CircleEntity.prototype.onDrag=function()
	{
		PG.Event.trigger(this,'OnEdit',[this.center.Clone(),this.radius]);
	};

	/**
		鼠標結束拖動時觸發			
	*/
	PG.CircleEntity.prototype.onEndEdit=function()
	{	
		PG.Event.trigger(this,'OnEditEnd',[this.center.Clone(),this.radius]);
	};

	/**
		結束編輯
	*/
	PG.CircleEntity.prototype.endEdit = function(){
		this._eEdit = false;
		var l;
		while(l = this.listeners.pop()){
			PG.Event.removeListener(l);
		}
		this.listeners = [];
		this.map.RemoveEntity(this.radiusDot);
		this.map.RemoveEntity(this.centerDot);
	};
	
	/**
		當編輯圓時,創建編輯點 
	*/
	PG.CircleEntity.prototype.createDragDot=function(){
			
			var offsetC = new PG.Point(this.edtImgSize[1][0],this.edtImgSize[1][1]);
			var sizeC = new PG.Size(this.edtImgSize[0][0],this.edtImgSize[0][1]);
			var iconC = new PG.Icon(this.edtImgPath[0],sizeC,offsetC);
			this.centerDot = new PG.MarkEntity(this.center,iconC);			
			this.map.AddEntity(this.centerDot);	
			
			var offsetR = new PG.Point(this.edtImgSize[3][0],this.edtImgSize[3][1]);
			var sizeR = new PG.Size(this.edtImgSize[2][0],this.edtImgSize[2][1]);
			var iconR = new PG.Icon(this.edtImgPath[1],sizeR,offsetR);
			this.radiusDot = new PG.MarkEntity(this.calRadiusDragDot(),iconR);
			this.map.AddEntity(this.radiusDot);	
			this.radiusDot.zIndexs[1]=530;
			PG.Tool.setZIndex(this.radiusDot.div,530);
			this.centerDot.zIndexs[1]=530;
			PG.Tool.setZIndex(this.centerDot.div,530);
	};

	/**
		計算拖動半徑點的經緯度
	*/
	PG.CircleEntity.prototype.calRadiusDragDot=function(){
		
			var scale = this.map.GetScale();
			var r = parseInt(this.radius/scale);
			var p1 = this.map.fromLatLngToContainerPixel(this.center);
			var p2 = this.map.fromContainerPixelToLatLng(new PG.Point(p1[0]+r,p1[1]));
			return p2;
	};
	
	window.PG.CircleEntity=PG.CircleEntity;
}
NSCircleEntity();