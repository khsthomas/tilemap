/**
	本文件是JS API之中的PG.RectEntityTool,PG.EllipseTool對像
	
*/
function NSRectTool()
{
	/**
		矩形地圖工具,用來實現在地圖上選擇一個區域或繪製矩形的功能
		
		map:  地圖對像
		config:	 JS對像,矩形的配置樣式信息,格式為{lineColor:'',fillColor:'',weight:'',fillOpacity:''}
		由於config和文檔裡面的屬性不一樣,所以修改了源代碼----徐金評 

	*/
	function RectTool(map,config,create)
	{
		this.config = config||{};
		this.lineColor = this.config.LineColor;
		this.fillColor = this.config.FillColor;
		this.lineStroke = this.config.LineStroke;
		this.fillOpacity = this.config.FillOpacity;
		this.lineStyle = this.config.LineStyle;
		if(create){this.create=create;}
		this.create();
		this.bounds=[];
		this.points=[];
		this.markers=[];
		this.rects=[];
		this.index=0;
		this.autoClear=false;
		this.initialize(map);
	}
	PG.RectTool = RectTool;

	/**
		創建	
	*/
	PG.RectTool.prototype.create=function()
	{
		this._value = "畫矩形";
	};

	/**
		開啟畫矩形工具。
		返回值如果為false，則表明開啟失敗，可能有其他工具正處於開啟狀態。請先關閉其他工具再進行開啟	
		this.flag為標識是否打開的全局變量
	*/
	PG.RectTool.prototype.Open = function(){
		if(this.flag){		
			if(!this.map.startOccupy(this._value)){return false;}
			this.map.DisableDrag();
			this.flag=false;
			this.mmdl=PG.Event.bind(this.map,"OnMouseDown",this,this.onMouseDown);
			this.mmul=PG.Event.bind(this.map,"OnMouseUp",this,this.onMouseUp);			
			this.lastPoint=null;
		}else{return false;}		
	};

	/**
		關閉畫矩形工具	
	*/
	PG.RectTool.prototype.Close = function(){
		if(!this.flag){
			this.map.endOccupy(this._value);
			this.map.EnableDrag();
			this.flag=true;
			PG.Event.removeListener(this.mmdl);
			PG.Event.removeListener(this.mmul);
			this.mmul=null;
			this.map.RemoveEntity(this.lastRect);
			if(this.autoClear){this.clear();}			
		}
	};
	
	/**
		清除所有該控件在地圖上繪製的矩形圖形	
	*/
	PG.RectTool.prototype.clear=function()
	{
		if(!this.rects){return;}
		var rect;
		while(rect=this.rects.pop()){this.map.RemoveEntity(rect,true);}
		rect=null;
		this.rects=[];
		this.bounds=[];		
		this.index=0;
	};

	/**
		繪製矩形	
	*/
	PG.RectTool.prototype.drawRect=function(bounds)
	{
		var rect=new PG.RectEntity(bounds,this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity);
		if(this.config.zIdx){PG.Tool.setZIndex(rect.GetObject(),this.config.zIdx);}
		return rect;
	};

	/**
		鼠標按下時觸發	
	*/
	PG.RectTool.prototype.onMouseDown = function(p)
	{	
		var pp=this.map.fromContainerPixelToLatLng(p);
		this.points.push(pp.Clone());	
		if(this.points.length==1){
			this.tempEntity=new PG.MarkEntity(pp);
			this.map.AddEntity(this.tempEntity);
		}				
	};

	/**
		結束繪製觸發	
	*/
	PG.RectTool.prototype.onMouseUp = function(p)
	{		
		if(this.points.length==2){			
			var left=Math.min(this.points[0].x,this.points[1].x);
			var right=Math.max(this.points[0].x,this.points[1].x);
			var bottom=Math.min(this.points[0].y,this.points[1].y);
			var top=Math.max(this.points[0].y,this.points[1].y);
			this.lastBounds=new PG.Rect(left,top,right,bottom,false);
			this.bounds.push(this.lastBounds);
			this.lastRect=this.drawRect(this.lastBounds);
			this.rects.push(this.lastRect);
			this.map.AddEntity(this.lastRect);
			this.index++;		
			this.points=[];
			this.map.RemoveEntity(this.tempEntity,true);
			if(this.lastRect.type == window.PG.ENTITY_CIRCLE){
				PG.Event.trigger(this,"OnDraw",[this.lastRect.center.Clone(),this.lastRect.radius]);
			}else{
				PG.Event.trigger(this,"OnDraw",[this.bounds[this.index-1],this.lastRect]);
			}			
		}		
	};

	/**
		初始化	
	*/
	PG.RectTool.prototype.initialize=function(map)
	{
		if(this.map){return false;}
		this.map=map;
		this.flag = true;
	};
	
	/**
		橢圓的繪製控件	
	*/
	function EllipseTool(map,config)
	{
		return new PG.RectTool(map,config,PG.EllipseTool.create);
	}
	PG.EllipseTool = EllipseTool;

	/**
		創建	
	*/
	PG.EllipseTool.create=function()
	{
		this._value = "畫橢圓";
		this.drawRect=PG.EllipseTool.drawRect;
	};

	/**
		繪製矩形	
	*/
	PG.EllipseTool.drawRect=function(bounds)
	{
		var rect=new PG.EllipseEntity(bounds,this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity);
		rect.type = window.PG.ENTITY_ELLIPSE;
		return rect;
	};

	/**
		橢圓的繪製控件	
	*/
	function CircleTool(map,config)
	{
		var r=new PG.RectTool(map,config);
		r.create=PG.CircleTool.create;
		r.drawRect=PG.CircleTool.drawRect;
		return r;
	}
	PG.CircleTool = CircleTool;

	/**
		創建	
	*/
	PG.CircleTool.create=function()
	{
		this._value = "畫圓";
		this.drawRect=PG.CircleTool.drawRect;
	};

	/**
		繪製矩形	
	*/
	PG.CircleTool.drawRect=function(bounds)
	{
		var rect=new PG.CircleEntity(this.points[0].Clone(),this.points[0].SphereDistance(this.points[1]),this.config);
		rect.type = window.PG.ENTITY_CIRCLE;
		return rect;
	};

	/**
		支持拉框放大控件	
	*/
	function ZoomInTool(map,config)
	{
		this.config = config?config:{};		
		this.config.bgcolor = this.config.bgcolor||"#CCCCFF";
		this.config.zIdx = 600;
		var control=new PG.RectTool(map,this.config,PG.ZoomInTool.create);
		control.padding = this.config.Padding||50;
		if(typeof this.config.ZoomAdd=="undefined"){
			control.zoomAdd = "auto";
		}else if(typeof this.config.ZoomAdd=="number"){
			control.zoomAdd = this.config.ZoomAdd;
		}
		PG.Event.bind(control,"OnDraw",control,PG.ZoomInTool.onDraw);
		return control;
	}
	PG.ZoomInTool = ZoomInTool;

	/**
		創建	
	*/
	PG.ZoomInTool.create=function()
	{
		this._value ="拉框放大";
	};

	/**
		繪製 	
	*/
	PG.ZoomInTool.onDraw=function(bounds)
	{
		this.clear();
		this.bounds=[];
		this.index=0;
		var centerPoint=bounds.GetCenter();
		var map=this.map;
		if(this.zoomAdd == "auto"){
			var zoomto = map.getBestZoom(bounds,this.padding);
			map.ZoomPan(centerPoint,zoomto>this.map.GetZoomLevel()?zoomto:this.map.GetZoomLevel());
		}else if(map.zoomIndex+this.zoomAdd>=0 && map.zoomIndex+this.zoomAdd<map.zoomLevels.length)
		{
			map.setCenterAtLatLng(centerPoint);
			map.zoomTo(this.map.zoomLevels[map.zoomIndex+this.zoomAdd]);
		}
		else
		{
			map.ZoomPan(centerPoint);
		}
		PG.Event.trigger(this,"OnDraw",[this,this.bounds[this.index-1],this.lastRect]);
	};

	window.PG.RectTool=PG.RectTool;
	window.PG.EllipseTool=PG.EllipseTool;
	window.PG.CircleTool=PG.CircleTool;
	window.PG.ZoomInTool=PG.ZoomInTool;
}
NSRectTool();