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
		this.listeners = [];
		this.edtImgSize=window.PG._circle_edt_imgSize;
		this.edtImgPath=window.PG._circle_edt_imgPath;
		this.create();
		PG.Event.bind(this.div,"touchstart",this,this.onMouseDown);			
		
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
		this.div = document.createElement('CANVAS');
		this.div.style.position='absolute';
		PG.Tool.setUnSelectable(this.div);
	};

	/**
		返回圓面積(平方米)		
	*/
	PG.CircleEntity.prototype.GetArea = function(){	
		return Math.PI*Math.pow(this.radius,2);
	};

	/**
		初始化				
	*/
	PG.CircleEntity.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.added=true;
		PG.Event.trigger(this,"init",[]);
	};

	/**
		重新绘制	
		noredraw  :是否重新绘制的参数,当拖动时,可以不需要重新绘制,只要重新设置位置就可以了
				  这样可以提高性能
		---徐金评2012-9-4	
	*/
	PG.CircleEntity.prototype.reDraw=function(flag,noredraw)
	{		
		//如果不是必須重繪,則不重繪,大部分的標注都不需要每次重繪
		if(!flag){return;}	
		
		var bounds=this.map.getBoundsLatLng();
		this.bounds = this.GetBounds(this.map);
		if(!flag && this.drawBounds && this.drawBounds.IsInclude(bounds)){return;}
		this.drawBounds=this.map.getDrawBounds();
		this.drawSpan=new PG.Rect(Math.max(this.drawBounds.left,this.bounds.left),Math.min(this.drawBounds.top,this.bounds.top),Math.min(this.drawBounds.right,this.bounds.right),Math.max(this.drawBounds.bottom,this.bounds.bottom),false);
		if(this.drawSpan.XminMercator>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>this.drawSpan.YmaxMercator)
		{
			if(this.added)
			{
				this.map.overlaysDiv.removeChild(this.div);
				this.added=false;
			}
			return;
		}
		else if(!this.added)
		{
			this.map.overlaysDiv.appendChild(this.div);
			this.added=true;
		}

		var p=this.map.GetRelativeXY(this.center.Clone());				
		var s = this.map.GetScale();
		var r = parseInt(this.radius/s);		
		PG.Tool.setPosition(this.div,[p[0]-r,p[1]-r]);

		if(!noredraw){
			var w = r * 2;
			this.div.width = w;
			this.div.height = w;
			PG.Tool.SetSize(this.div,[w,w]);

			var cxt = this.div.getContext('2d');

			cxt.clearRect(0,0,w,w);

			cxt.strokeStyle = this.color;
			cxt.lineWidth = this.weight;
			cxt.fillStyle = this.bgcolor;
			cxt.globalAlpha = this.opacity;		

			cxt.beginPath();
			cxt.arc(r,r,r,0,2*Math.PI,false);
			cxt.closePath();
			cxt.fill();
			cxt.stroke();
		}
		
	};
	
	/**
		返回矩形范围
	*/
	PG.CircleEntity.prototype.GetBounds = function(map)
	{
		 if(!map){return null;}
		 var p = map.WorldToWindow(this.center);
	     var scale = map.GetScale();
	     var r = parseInt(this.radius/scale);
	     var min = map.WindowToWorld(new PG.Point(p.x-r,p.y+r));//最小点
	     var max = map.WindowToWorld(new PG.Point(p.x+r,p.y-r));//最大点
		 return new PG.Rect(min.x,max.y,max.x,min.y,false);
	};	

	/**
		返回容器			
	*/
	PG.CircleEntity.prototype.GetObject=function(){
		return this.div;
	};

	/**
		刪除	
	*/
	PG.CircleEntity.prototype.remove=function()
	{
		if(this.div.parentNode&&this.div){
			this.div.parentNode.removeChild(this.div);
		}
		this.added=false;
		this.map=null;
	};

	/**
		銷毀 			
	*/
	PG.CircleEntity.prototype.depose=function()
	{
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
		if(this.map)
		{
			this.reDraw(true);
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
		if(this.map)
		{
			this.reDraw(true);
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
		if(this.map)
		{
			this.reDraw(true);
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
		if(this.map)
		{
			this.reDraw(true);
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
	};

	/**
		啟動編輯功能
	*/
	PG.CircleEntity.prototype.EnableEdit = function(){
		this._eEdit = true;	
		PG.Tool.setZIndex(this.div,520);
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
		PG.Tool.setZIndex(this.div,500);
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

		var radiusDotUp = PG.Event.addListener(this.radiusDot,'OnDragEnd',function(lnglat){
				circle.onEndEdit();	
		});

		var centerDotUp = PG.Event.addListener(this.centerDot,'OnDragEnd',function(lnglat){
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
		this.DisableEdit();
		PG.Event.trigger(this,'OnEditEnd',[this.center.Clone(),this.radius]);
	};

	/**
		結束編輯
	*/
	PG.CircleEntity.prototype.endEdit = function(){
		this._eEdit = false;
		for(var i=0;i<this.listeners.length;i++){
			PG.Event.removeListener(this.listeners[i]);
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
			//var sizeC = new PG.Size(100,100);
			var iconC = new PG.Icon(this.edtImgPath[0],sizeC,offsetC);
			this.centerDot = new PG.MarkEntity(this.center,iconC);			
			this.map.AddEntity(this.centerDot);	
			
			var offsetR = new PG.Point(this.edtImgSize[3][0],this.edtImgSize[3][1]);
			var sizeR = new PG.Size(this.edtImgSize[2][0],this.edtImgSize[2][1]);
			//var sizeR = new PG.Size(100,100);
			var iconR = new PG.Icon(this.edtImgPath[1],sizeR,offsetR);
			this.radiusDot = new PG.MarkEntity(this.calRadiusDragDot(),iconR);
			this.map.AddEntity(this.radiusDot);
			
			this.centerDot.zIndexs[1]=530;
			PG.Tool.setZIndex(this.centerDot.div,530);

			this.radiusDot.zIndexs[1]=530;
			PG.Tool.setZIndex(this.radiusDot.div,530);
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