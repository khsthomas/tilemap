/**
	地圖類型控件 
	
	這個類的大部分功能沒有對外公開
*/
function NSMapTypeControl(){

	function MapTypeControl(){
		PG.Tool.inherit(this,PG.Control);
		this.otherBtn = [];//		按鈕
		this.lastFocus=null;
		var tempDiv=document.createElement("div");
		tempDiv.innerHTML="<div style='top:10px;right:30px;position:absolute;width:auto;cursor:hand'></div>";
		this.div=tempDiv.firstChild;
		this.div._control=this;
		this.bInfo = PG.Tool.browserInfo();	
		PG.Event.addListener(this.div,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"selectstart",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"click",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		this.imgPath = window.PG._IMG_PATH + "maptype/";
		this.mapTypeNum=0;

	}
	PG.MapTypeControl = MapTypeControl;

	/**
		初始化
	*/
	PG.MapTypeControl.prototype.initialize=function(map)
	{
		this.map=map;

		var mys = this.map.GetMapTypes();
		for(var i=0;i<mys.length;i++){	
			this.addNewType(mys[i]);
		}
		
		this.lastFocus=this.otherBtn[1];
		this.setButtonFocus(this.lastFocus);
		
		PG.Event.bind(this.map,"changemaptype",this,this.onMapTypeChange);
		PG.Event.bind(this.map,"addmaptype",this,this.onAddMapType);
		PG.Event.bind(this.map,"removemaptype",this,this.onRemoveMapType);
		
		var mp = this.map.GetCurrentMapType();
		this.onMapTypeChange(mp);	
	};
	
	/**
		當改變地圖類型時觸發,以改變按鈕樣式
	*/
	PG.MapTypeControl.prototype.onMapTypeChange=function(mt){
		this.setButtonBlur(this.lastFocus);
		this.lastFocus=this.getBtnFromType(mt);
		this.setButtonFocus(this.lastFocus);
	};

	/**
		當添加地圖類型時觸發
	*/
	PG.MapTypeControl.prototype.onAddMapType=function(mt){
		this.addNewType(mt);			//新代碼---徐金評修改
	};

	/**
		當刪除地圖類型時觸發
	*/
	PG.MapTypeControl.prototype.onRemoveMapType=function(mt){
		this.removeNewType(mt);
	};

	/**
		返回容DIV器
	*/
	PG.MapTypeControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		
	*/
	PG.MapTypeControl.prototype.remove=function()
	{
		this.map=null;
	};

	/**
		
	*/
	PG.MapTypeControl.prototype.depose=function()
	{
		this.div._control=null;
		PG.Event.deposeNode(this.div);
		this.div=null;
	};

	/**
		當按鈕獲得焦點時觸發
	*/
	PG.MapTypeControl.prototype.setButtonFocus=function(obj)
	{
		if(obj==null)return;
		obj.style.fontWeight="bold";
		obj.style.backgroundImage = 'url(' + this.imgPath + "but-focus.jpg" + ')';
	};

	/**
		當按鈕失去焦點時觸發
	*/
	PG.MapTypeControl.prototype.setButtonBlur=function(obj)
	{
		if(obj==null)return;
		obj.style.fontWeight="normal";
		obj.style.backgroundImage = 'url(' + this.imgPath + "but-blur.jpg" + ')';
	};

	/**
		隱藏地圖類型
	*/
	PG.MapTypeControl.prototype.hiddenMapType=function(mp)
	{
		this.onRemoveMapType(mp);
	};

	/**
		顯示地圖類型
	*/
	PG.MapTypeControl.prototype.showMapType=function(mp)
	{
		this.onAddMapType(mp);
	};

	/**
		設置地圖類型控件的可見性
	*/
	PG.MapTypeControl.prototype.setVisibile=function(flag){
		if(flag){
			this.div.style.display="";
		}else{
			this.div.style.display="none";
		}
	};

	/**
		添加地圖類型
		type:PG.MapType

		傳入config = {}; config.name = "地圖類型";
	*/
	PG.MapTypeControl.prototype.addNewType=function(type){
		var newtype = ++this.mapTypeNum;
		var tempDiv = document.createElement("div");
		tempDiv.innerHTML = this.getBtnHtml(type.GetName(true));
		this.otherBtn.push(tempDiv.firstChild);
		var btn = this.otherBtn[this.otherBtn.length-1];
		btn.maptp = type;
		this.div.appendChild(btn);
		PG.Event.addListener(btn,"dblclick",PG.Event.cancelBubble);
		PG.Event.bind(btn,this.bInfo.isMwk?"touchstart":"mousedown",this,(function(btn,obj){
				return function(){
					btn._s_Ms_d = true;
					obj.setButtonFocus(btn);
				}
			})(btn,this));
		PG.Event.bind(btn,this.bInfo.isMwk?"touchend":"mouseup",this,(function(btn,obj){
				return function(){
					btn._s_Ms_d = false;
					obj.setButtonBlur(btn);
				}
			})(btn,this));
		PG.Event.bind(btn,this.bInfo.isMwk?"touchend":"mouseout",this,(function(btn,obj){
				return function(){
					if(btn._s_Ms_d){
						if(obj.lastFocus!=btn)
							obj.setButtonBlur(btn);
					}
					btn._s_Ms_d = false;
				}
			})(btn,this));
		PG.Event.bind(btn,this.bInfo.isMwk?"touchstart":"click",this,(function(num,obj){
				return function(){
					obj.setMapTypeByNum(num);
				}
			})(this.otherBtn.length-1,this));
			
	};

	/**
		刪除地圖類型
	*/
	PG.MapTypeControl.prototype.removeNewType=function(mp)
	{
		var btn = this.getBtnFromType(mp);
		PG.Event.deposeNode(btn);
	};

	/**
		通過號碼設置類型--單擊地圖類型控件上的類型按鈕時執行的方法
	*/
	PG.MapTypeControl.prototype.setMapTypeByNum=function(num){
		var btn = this.otherBtn[num];
		this.setButtonBlur(this.lastFocus);
		this.lastFocus=btn;
		this.setButtonFocus(this.lastFocus);
		this.map.SetMapType(btn.maptp);
	};

	/**
		得到地圖類型的切換按鈕
	*/
	PG.MapTypeControl.prototype.getBtnHtml=function(nm){
		return "<div style='width:67px;height:17px;float:left;margin-left:2px;line-height:17px;padding-top:2px;text-align:center;font-size:12px;cursor:pointer;background:url(" + this.imgPath + "but-blur.jpg" + ")"+"'>"+nm+"</div>";
	};

	/**
		通過類型得到切換按鈕
	*/
	PG.MapTypeControl.prototype.getBtnFromType = function(mp){
		for(var i=0;i<this.otherBtn.length;i++){
			if(this.otherBtn[i].maptp==mp){
				return this.otherBtn[i];
			}
		}
	};

	window.PG.MapTypeControl=PG.MapTypeControl;
}
NSMapTypeControl();