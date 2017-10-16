/**
	本文件是JS API之中的PG.ContextMenu,PG.MenuItem類

*/
function MapNSContextMenu()
{
	/**
		此類表示右鍵菜單.您可以在地圖上添加自定義內容的右鍵菜單.
		注意:手機版不支持.		
	*/
	function ContextMenu(menuItem,option){
		this._menuItemTemp = menuItem||[];
		this._menuItem = [];
		this._opt = option||{};
		this._sep = [];
		
		this.div = PG.Tool.createDiv(1,null,1);
		var _d  = document;
		this.div = PG.Tool.createDiv(1,null,1);
		this.div.style.color = "#000000";
		this.div.style.fontSize = "12px";
		this.div.style.lineHeight = "17px";
		this.div.style.zIndex = 5000;
		this.innerDiv = _d.createElement("div");
		this.innerDiv.style.font = "12px arial,mingliu";
		this.innerDiv.style.background = "none repeat scroll 0 0 #FFFFFF";
		this.innerDiv.style.borderColor = "#ADBFE4 #8BA4D8 #8BA4D8 #ADBFE4";
		this.innerDiv.style.borderStyle = "solid";
		this.innerDiv.style.borderWidth = "1px";
		
		this.div.appendChild(this.innerDiv);
		
		this._shadow = _d.createElement("div");
		this._shadow.style.zIndex = -1;
		this._shadow.style.position = "absolute";
		this._shadow.style.background  = "none repeat scroll 0 0 #000000";
		PG.Tool.setOpacity(this._shadow,"0.3");
		this.div.appendChild(this._shadow);
	}
	PG.ContextMenu = ContextMenu;

	/**
		初始化	
	*/
	PG.ContextMenu.prototype.initialize = function(map){
		this.map = map;		
		this.initListener();		
		this.map.GetContainer().appendChild(this.div);
		this.hide();		
	};

	/**
		初始化事件監聽器	
	*/
	PG.ContextMenu.prototype.initListener = function(){
		this._cmL = PG.Event.bind(this.map.GetContainer(),"contextmenu",this,this.onRightClk);
		this._docL = PG.Event.bind(document,"click",this,this.onDocClk);		
	};
	
	/**
		右擊地圖時顯示菜單---徐金評	
	*/
	PG.ContextMenu.prototype.onRightClk = function(e){
		if(!this.map){return;}
		var pos = PG.Tool.getEventPosition(e,this.map.GetContainer());		
		this.show(pos[0],pos[1]);		
	};
	
	/**
		單擊頁面時執行的方法---隱藏菜單	
	*/
	PG.ContextMenu.prototype.onDocClk = function(e){
		this.hide();
	};
	
	/**
		添加菜單項,並綁定觸發事件	
	*/
	PG.ContextMenu.prototype.AddItem = function(menuItem){
		this._menuItem.push(menuItem);
		var _t = this;
		PG.Event.bind(menuItem.PG_div,"mouseover",menuItem.PG_div,function(){
			if(menuItem._isDisable){return;}
			this.style.color = "#68c";
		});
		PG.Event.bind(menuItem.PG_div,"mouseout",menuItem.PG_div,function(){
			if(menuItem._isDisable){return;}
			this.style.color = "#000";
		});
		PG.Event.bind(menuItem.PG_div,"click",menuItem.PG_div,function(){
			if(menuItem._isDisable){ return;}
			menuItem._callBack(_t.map.fromContainerPixelToLatLng(_t._c_p));
		});
		this.innerDiv.appendChild(menuItem.PG_div);
	};

	/**
		移除菜單項

		itemIndex: Integer 類型,菜單項的索引號,從 0 開始.	
	*/
	PG.ContextMenu.prototype.RemoveItem = function(itemIndex){
		if(typeof(itemIndex)==="object"){
			var idx = 0;
			for(var i=0;i<this._menuItem.length;i++){
				if(itemIndex==this._menuItem[i]){
					idx = i;
					break;
				}
			}
			itemIndex = idx;
		}
		var ary = this._menuItem.splice(itemIndex,1);
		PG.Event.deposeNode(ary[0].PG_div);
		ary[0].PG_div = null;
	};

	/**
		返回指定索引位置的菜單項,第一個菜單項的索引為0	
	*/
	PG.ContextMenu.prototype.GetItem = function(itemIndex){
		return this._menuItem[itemIndex];
	};

	/**
		返回所有的PG.MenuItem,是一個數組	
	*/
	PG.ContextMenu.prototype.GetItems = function(){
		return this._menuItem;
	};

	/**
		添加分隔符	
	*/
	PG.ContextMenu.prototype.AddSeparator = function(){
		var _s = document.createElement("div");
		this._sep.push(_s);
		_s.style.border = "none";
		_s.style.borderBottom = "1px solid #ADBFE4";
		_s.style.margin = "0 6px";
		_s.style.padding = "1px";
		_s.style.borderBottomStyle = "solid";
		_s.style.fontSize = "0px";
		this.innerDiv.appendChild(_s);
	};

	/**
		移除指定索引位置的分隔符,第一個分隔符的索引為0	
	*/
	PG.ContextMenu.prototype.RemoveSeparator = function(index){
		this.innerDiv.removeChild(this._sep.splice(index,1)[0]);
	};

	/**
		返回所有的分割線,是一個數組	
	*/
	PG.ContextMenu.prototype.GetAllSeparator = function(){
		return this._sep;
	};

	/**
		刪除	
	*/
	PG.ContextMenu.prototype.remove = function(){
		PG.Event.removeListener(this._cmL);
		this._cmL = null;
		PG.Event.removeListener(this._docL);
		this._docL = null;
		if(this.map){
			this.map.GetContainer().removeChild(this.div);
			this.map = null;
		}
	};

	/**
		隱藏	
	*/
	PG.ContextMenu.prototype.hide = function(){
		this.div.style.visibility = "hidden";		
		PG.Event.trigger(this,"OnClose",[]);
	};

	/**
		顯示	
	*/
	PG.ContextMenu.prototype.show = function(x, y){
		var vs = this.map.GetWindow();
		if(this._menuItem.length==0){
			return;
		}
		if(x + this.innerDiv.offsetWidth<vs.width){
			this.div.style.left = x + "px";
		}else{
			this.div.style.left = x - this.innerDiv.offsetWidth + "px";
		}
		if(y + this.innerDiv.offsetHeight<vs.height){
			this.div.style.top = y + "px";
		}else{
			this.div.style.top = y - this.innerDiv.offsetHeight + "px";
		}
		this.div.style.visibility = "visible";
		
		this._shadow.style.width = this.innerDiv.offsetWidth + "px";
		this._shadow.style.height = this.innerDiv.offsetHeight + "px";
		this._shadow.style.left = 1 + "px";
		this._shadow.style.top = 2 + "px";
		var  p = new PG.Point(x,y);
		this._c_p = p;
		PG.Event.trigger(this,"OnOpen",[p]);
	};

	/**
		此類表示一個菜單項.   注意:手機版不支持.
		
		text:					菜單項的顯示文字
		callbackFunction:		點擊菜單時的回調函數,可選
		itemOptions:			可選配置參數,為一個對像,格式為{width:1}
		width 指定此菜單項的寬度,菜單以最長的菜單項寬度為準
	*/
	function MenuItem(text,callbackFunction,itemOptions){
		this._text = text;
		this._callBack = callbackFunction||function(){};
		this._opt = itemOptions||{};
		
		this.PG_div = document.createElement("div");
		this.PG_div.style.padding = "2px 6px";
		this.PG_div.style.cursor = "pointer";
		this.PG_div.innerHTML = text;
		
		if(this._opt.width){
			this.PG_div.style.minWidth = this._opt.width + "px";
			if(PG.Tool.browserInfo().isIE6){
				this.PG_div.style.width = this._opt.width + "px";
			}
			
		}
	}
	PG.MenuItem = MenuItem;

	/**
		設置菜單項顯示的文本	
	*/
	PG.MenuItem.prototype.SetText = function(text){
		this._text = text;
		this.PG_div.innerHTML = _text;
	};

	/**
		啟用菜單項	
	*/
	PG.MenuItem.prototype.Enable = function(text){
		this._isDisable = false;
		this.PG_div.style.color = "";
		this.PG_div.style.cursor = "pointer";
	};

	/**
		禁用菜單項	
	*/
	PG.MenuItem.prototype.Disable = function(text){
		this._isDisable = true;
		this.PG_div.style.color = "#AAAAAA";
		this.PG_div.style.cursor = "default";
	};
	
	window.PG.ContextMenu = PG.ContextMenu;
	window.PG.MenuItem = PG.MenuItem;
}
MapNSContextMenu();