/**
	本文件是JS API之中的PG.CircleTool對像
	
*/
function NSCircleTool()
{
	/**
		圓地圖工具,用來實現在地圖上選擇一個區域或繪製圓的功能
		
		map:  地圖對像
		
		config:	請參考PG.Circle

	*/
	function CircleTool(map,config)
	{
		this.config = config||{};
		this.create();
		this.circles=[];
		this.index=0;
		this.autoClear=true;
		this.initialize(map);
	}
	PG.CircleTool = CircleTool;

	/**
		創建	
	*/
	PG.CircleTool.prototype.create=function()
	{
		this._value = "畫圓";
	};

	/**
		開啟畫圓工具。
		返回值如果為false，則表明開啟失敗，可能有其他工具正處於開啟狀態。請先關閉其他工具再進行開啟	
		this.flag為標識是否打開的全局變量
	*/
	PG.CircleTool.prototype.Open  = function(){
		if(this.flag){
			if(!this.map.startOccupy(this._value)){return false;}
			this.map.DisableDrag();
			this.flag=false;
			this.mmdl=PG.Event.bind(this.map.container,"mousedown",this,this.onMouseDown);			
			this.startPoint=null;
			this.lastPoint=null;			
			this.centerPoint=null;
			this.radius=0;
			this.lastCircle=null;
			this.map.SetMapCursor("crosshair","crosshair");
		}else{return false;}		
	};

	/**
		關閉畫圓工具	
	*/
	PG.CircleTool.prototype.Close = function(){
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
			this.circles=[];
			this.index=0;
			this.map.SetMapCursor(window._map_cur[0],window._map_cur[1]);
		}
	};
	
	/**
		清除所有該控件在地圖上繪製的圓圖形	
	*/
	PG.CircleTool.prototype.clear=function()
	{
		if(!this.circles){return;}
		var circle;
		while(circle=this.circles.pop()){this.map.RemoveEntity(circle);}
		circle=null;
	};


	/**
		鼠標按下時觸發	
	*/
	PG.CircleTool.prototype.onMouseDown = function(e)
	{
		var point = PG.Tool.getEventPosition(e,this.map.container);
		var p = new PG.Point(point[0],point[1]);
		this.startPoint=this.map.fromContainerPixelToLatLng(p);
		this.centerPoint=new PG.Point(this.startPoint.x,this.startPoint.y,false);		
		this.lastPoint=null;
		this.lastCircle=null;
		this.radius=0;
		this.mmdrl=PG.Event.bind(document,"mousemove",this,this.onMouseMove);
		this.mmul=PG.Event.bind(document,"mouseup",this,this.onMouseUp);		
		if(this.map.container.setCapture){this.map.container.setCapture();}
	};

	/**
		結束繪製觸發	
	*/
	PG.CircleTool.prototype.onMouseUp = function(e)
	{
		PG.Event.cancelBubble(e);
		if(document.releaseCapture){document.releaseCapture();}
		this.index++;
		PG.Event.removeListener(this.mmdrl);
		PG.Event.removeListener(this.mmul);		
		this.lastCircle.endEdit();
		PG.Event.trigger(this,"OnDraw",[this.centerPoint.Clone(),this.radius]);
	};

	/**
		鼠標移動時觸發	
	*/
	PG.CircleTool.prototype.onMouseMove = function(e)
	{
		var point = PG.Tool.getEventPosition(e,this.map.container);
		var p = new PG.Point(point[0],point[1]);
		this.lastPoint=this.map.fromContainerPixelToLatLng(p);
		if(!this.lastCircle){	
			this.lastCircle=this.drawCircle();
			this.lastCircle.EnableEdit();
			this.circles.push(this.lastCircle);
			this.map.AddEntity(this.lastCircle);
		}else{
			this.drawCircle();
			var scale = this.map.GetScale();
			var r = parseInt(this.radius/scale);
			var p1 = this.map.fromLatLngToContainerPixel(this.startPoint);
			var p2 = this.map.fromContainerPixelToLatLng(new PG.Point(p1.x+r,p1.y));
			this.lastCircle.radiusDot.SetPoint(p2);
		}
	};

	/**
		繪製圓	
	*/
	PG.CircleTool.prototype.drawCircle=function()
	{
		this.radius = PG.Tool.getPointsDistance(this.startPoint,this.lastPoint);
		if(this.lastCircle){			
			this.lastCircle.SetCenter(this.centerPoint,this.radius);			
		}else{
			return new PG.CircleEntity(this.centerPoint,this.radius,this.config);
		}	
	};

	/**
		初始化	
	*/
	PG.CircleTool.prototype.initialize=function(map)
	{
		if(this.map){return false;}
		this.map=map;
		this.flag = true;
	};
	
	window.PG.CircleTool=PG.CircleTool;

}
NSCircleTool();