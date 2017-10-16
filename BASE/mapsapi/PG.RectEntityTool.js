/**
	本文件是JS API之中的PG.RectTool,PG.EllipseTool,PG.ZoomInTool對像
	
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
		var color = this.config.LineColor;
		var bgcolor = this.config.FillColor;
		var weight = this.config.LineStroke;
		var opacity = this.config.FillOpacity;		
		this.lineColor=(color || color=="")?color:"#003366";
		this.fillColor=(bgcolor || bgcolor=="")?bgcolor:"#CCCCFF";
		this.lineStroke=weight?weight:1;
		this.fillOpacity=opacity?opacity:0.5;
		this.lineStyle = this.config.LineStyle;
		if(create){this.create=create;}
		this.create();
		this.bounds=[];
		this.rects=[];
		this.index=0;
		this.autoClear=true;
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
	PG.RectTool.prototype.Open  = function(){
		if(this.flag){
			if(!this.map.startOccupy(this._value)){return false;}
			this.map.DisableDrag();
			this.flag=false;
			this.mmdl=PG.Event.bind(this.map.container,"mousedown",this,this.onMouseDown);			
			this.lastPoint=null;
			this.map.SetMapCursor("crosshair","crosshair");
		}else{return false;}		
	};

	/**
		關閉畫矩形工具	
	*/
	PG.RectTool.prototype.Close  = function(){
		if(!this.flag){
			this.map.endOccupy(this._value);
			this.map.EnableDrag();
			this.flag=true;
			PG.Event.removeListener(this.mmdl);
			PG.Event.removeListener(this.mmdrl);
			PG.Event.removeListener(this.mmul);
			this.mmdl=null;
			this.mmdrl=null;
			this.mmul=null;
			if(this.autoClear){this.clear();}
			this.rects=[];
			this.bounds=[];
			this.index=0;
			this.map.SetMapCursor(window._map_cur[0],window._map_cur[1]);
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
	};

	/**
		繪製矩形	
	*/
	PG.RectTool.prototype.drawRect=function(bounds)
	{
		var rect=new PG.RectEntity(bounds,this.lineColor,this.fillColor,this.lineStroke,this.fillOpacity);
		if(this.lineStyle){rect.SetLineStyle(this.lineStyle);}
		if(this.config.zIdx){PG.Tool.setZIndex(rect.GetObject(),this.config.zIdx);}
		return rect;
	};

	/**
		鼠標按下時觸發	
	*/
	PG.RectTool.prototype.onMouseDown = function(e)
	{
		if(this.dragObj){this.onMouseUp(e);}
		var dragObj={startPoint:PG.Tool.getEventPosition(e,this.map.container),startDivPoint:[e.clientX,e.clientY]};
		dragObj.mmdrl=PG.Event.bind(document,"mousemove",this,this.onMouseMove);
		dragObj.mmul=PG.Event.bind(document,"mouseup",this,this.onMouseUp);		
		this.lastPoint=this.map.fromContainerPixelToLatLng(new PG.Point(dragObj.startPoint[0],dragObj.startPoint[1]));
		this.lastBounds=new PG.Rect(this.lastPoint.x,this.lastPoint.y,this.lastPoint.x,this.lastPoint.y,false);
		this.bounds.push(this.lastBounds);
		this.lastRect=this.drawRect(this.lastBounds);
		this.rects.push(this.lastRect);
		this.dragObj=dragObj;
		this.map.AddEntity(this.lastRect);		
		if(this.map.container.setCapture){this.map.container.setCapture();}
	};

	/**
		結束繪製觸發	
	*/
	PG.RectTool.prototype.onMouseUp = function(e)
	{
		PG.Event.cancelBubble(e);
		if(document.releaseCapture){document.releaseCapture();}
		this.index++;
		var dragObj=this.dragObj;
		if(dragObj){
			PG.Event.removeListener(dragObj.mmdrl);
			PG.Event.removeListener(dragObj.mmul);
		}
		this.dragObj=null;
		PG.Event.trigger(this,"OnDraw",[this.bounds[this.index-1],this.lastRect]);
		this.lastPoint=null;
	};

	/**
		鼠標移動時觸發	
	*/
	PG.RectTool.prototype.onMouseMove = function(e)
	{
		var dragObj=this.dragObj;
		var p=this.map.fromContainerPixelToLatLng([dragObj.startPoint[0]+e.clientX-dragObj.startDivPoint[0],dragObj.startPoint[1]+e.clientY-dragObj.startDivPoint[1]]);
		this.lastBounds=new PG.Rect(Math.min(p.x,this.lastPoint.x),Math.max(p.y,this.lastPoint.y),Math.max(p.x,this.lastPoint.x),Math.min(p.y,this.lastPoint.y),false);
		this.bounds[this.index]=this.lastBounds;
		this.lastRect.SetBounds(this.lastBounds);
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
		if(this.lineStyle){rect.SetLineStyle(this.lineStyle);}
		rect.type = window.PG.ENTITY_ELLIPSE;
		return rect;
	};

	/**
		支持拉框放大控件	
	*/
	function ZoomInTool(map,config)
	{
//		zoomAdd,padding,color,bgcolor,weight,opacity  這些參數可以寫在config中
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
	window.PG.ZoomInTool=PG.ZoomInTool;
}
NSRectTool();