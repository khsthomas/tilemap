/**
	本文件是JS API之中的PG.MarkTool對像
	
*/
function NSMarkTool(){
	
	/**
		標注工具,用來讓用戶在地圖上標注一個點,可以通過該工具提供的事件來獲得用戶標點的位置

	*/
	function MarkTool(map,icon,cursor,follow)
	{		
		this.setIcon(icon?icon:new PG.Icon());
		this.cursor=cursor?cursor:"pointer";
		this.follow=(follow!=false);
		this._value = " 標注工具 ";
		this.bInfo = PG.Tool.browserInfo();
		this.autoClear=false;
		this.initialize(map);
	}
	PG.MarkTool = MarkTool;

	/**
		設置Icon
	*/
	PG.MarkTool.prototype.setIcon=function( icon )
	{
		this.icon=icon;
		this.iconObj=this.icon.GetObject();
		PG.Tool.setZIndex(this.iconObj,500);
		if(this.marker){this.marker.SetIcon(icon);}
	};

	/**
		開啟標注工具.
		返回值如果為false,則表明開啟失敗,可能有其他工具正處於開啟狀態.請先關閉其他工具再進行開啟

		this.flag為標識是否打開的全局變量
	*/
	PG.MarkTool.prototype.Open = function(){
		if(!this.flag ){
			if(!this.map.startOccupy(this._value)){return false;}
			if(!this.marker ){//刪除之前存在的標點
				this.marker=new PG.MarkEntity(null,this.icon);
			}
			this.flag = true;
			this.lastCursor=this.map.mapCursor[0];
			this.map.SetMapCursor(this.cursor);
			if(this.follow){
				this.map.AddEntity(this.marker);
			}else{
				this.map.RemoveEntity(this.marker);
			}
			this.point=null;
			this.mmoveListener=PG.Event.bind(this.map.container,"mousemove",this,this.followCursor);
			this.mupListener=PG.Event.bind(this.map,this.bInfo.isMwk?"OnMouseDown":"OnClick",this,this.setPoint);
			PG.Tool.setCursorStyle(this.map.container,"default");
			return true;
		}else{
			return false;
		}
	};

	/**
		關閉標注工具
	*/
	PG.MarkTool.prototype.Close = function(){
		if(this.flag)
		{
			this.map.endOccupy(this._value);
			this.map.SetMapCursor(this.lastCursor);
			PG.Event.removeListener(this.mmoveListener);
			this.mmoveListener=null;
			PG.Event.removeListener(this.mupListener);
			this.mupListener=null;
			PG.Tool.setCursorStyle(this.map.container,"default");
			if(this.marker){this.map.RemoveEntity(this.marker,true); this.marker = null;}
			this.flag = false;
		}
	};

	/**
		鼠標跟隨,標注一直跟隨鼠標
	*/
	PG.MarkTool.prototype.followCursor = function(point)
	{
		var position = PG.Tool.getEventPosition(point,this.map.container);
		this.marker.SetPoint(this.map.fromContainerPixelToLatLng(position));
	};

	/**
		標點---當單擊地圖結束標注工具時,執行此函數
	*/
	PG.MarkTool.prototype.setPoint = function(point)
	{
		this.point = this.map.fromContainerPixelToLatLng( point );
		this.map.AddEntity(this.marker);
		this.marker.SetPoint(this.point);
		this.Close();
		PG.Event.trigger(this,"OnMouseUp",[this.point.Clone()]);
	};

	/**
		初始化
	*/
	PG.MarkTool.prototype.initialize = function(map)
	{
		if(this.map){return false;}
		this.map = map;
	};

	/**
		設置標注控件顯示的標注圖標路徑URL
	*/
	PG.MarkTool.prototype.SetPointImage = function( url )
	{
		this.icon.SetImageUrl(url);
		this.icon.SetSize();
		this.icon.SetAnchor();
	};

	/**
		獲取用戶標注的點,如果用戶還沒標點,則返回null
	*/
	PG.MarkTool.prototype.GetPoint = function(){return this.point;};

	window.PG.MarkTool = PG.MarkTool;
}
NSMarkTool();