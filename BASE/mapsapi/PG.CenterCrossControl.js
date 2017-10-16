/**
	本文件是JS API之中的PG.CenterCrossControl類
	跟隨地圖的中心十字,中心十字指向地圖中心點位置		
*/

function NSCenterCrossControl(){
	
	function CenterCrossControl(config)
	{
		this._cfg = config||{};
		PG.Tool.inherit(this,PG.Control);
		this.div=document.createElement("div");
		this.div._control=this;
		this.div.style.position = "absolute";
		PG.Event.addListener(this.div,"mousedown",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"selectstart",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"click",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		
		//水平條和垂直條大小[寬度,高度]
		this._h_wh = [20,2];
		this._v_wh = [2,20];
		this._cfg.color = this._cfg.color||"#FF6347";
		this.create();
	}
	PG.CenterCrossControl = CenterCrossControl;

	/**
		創建控件		
	*/
	PG.CenterCrossControl.prototype.create = function(){
		var _t = this;
		var str = [];
		var comm = "position:absolute;font-size:0px;background:" + this._cfg.color + ";";
		str.push("<div id='_PGCCC_h' style='position:absolute;width:"+_t._h_wh[0] + "px;height:" + _t._h_wh[1]+"px;"+comm+";'>");
		str.push("</div>");
			
		str.push("<div id='_PGCCC_v' style='position:absolute;width:"+_t._v_wh[0] + "px;height:" + _t._v_wh[1]+"px;"+comm+";'>");
		str.push("</div>");
		
		var doc = document;
		var tp = doc.createElement("div");
		tp.innerHTML = str.join("");
		
		doc.body.appendChild(tp);
		this.cross_h =this.resetID(doc,"_PGCCC_h",""); 
		this.cross_v =this.resetID(doc,"_PGCCC_v",""); 
		document.body.removeChild(tp);
		
		PG.Tool.setUnSelectable(this.cross_h);
		PG.Tool.setUnSelectable(this.cross_v);
		this.div.appendChild(this.cross_h);
		this.div.appendChild(this.cross_v);
	};
	
	/**
		初始化控件		
	*/
	PG.CenterCrossControl.prototype.initialize=function(map)
	{
		this.map=map;
		this.listener=[PG.Event.bind(this.map,"OnResize",this,this.onRs)];//註冊map監聽事件
		this.setPos();
	};

	/**
		設置控制項的顏色
	*/
	PG.CenterCrossControl.prototype.SetColor = function(color){
		this._cfg.color = color;
		this.cross_h.style.background = color;
		this.cross_v.style.background = color;
	};

	/**
		控件寬度和高度
	*/
	PG.CenterCrossControl.prototype.SetSize = function(size){
		this._h_wh[0] = size.width;
		this._v_wh[1] = size.height;
		var vs = this.map.GetWindow();
		var hl = vs[0]/2 - this._h_wh[0]/2;
		var ht = vs[1]/2 - this._h_wh[1]/2;
		var vl = vs[0]/2 - this._v_wh[0]/2;
		var vt = vs[1]/2 - this._v_wh[1]/2;
		this.cross_h.style.left = hl + "px"; 
		this.cross_h.style.top = ht + "px"; 
		this.cross_v.style.left = vl + "px"; 
		this.cross_v.style.top = vt + "px"; 

		this.cross_h.style.width = size.width + 'px';
		this.cross_v.style.height = size.height + 'px';

	};

	/**
		控件線粗細
	*/
	PG.CenterCrossControl.prototype.SetStroke = function(stroke){
		this._h_wh[1] = stroke;
		this._v_wh[0] = stroke;
		this.cross_h.style.height = stroke + 'px';
		this.cross_v.style.width = stroke + 'px';
	};

	/**
		返回容器
	*/
	PG.CenterCrossControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		
	*/
	PG.CenterCrossControl.prototype.remove=function()
	{
		var l;
//		移除監聽事件
		while(l = this.listener.pop()){
			PG.Event.removeListener(l);
		}
		this.map=null;
	};

	/**
		銷毀控件
	*/
	PG.CenterCrossControl.prototype.depose=function()
	{
		this.div._control=null;
		PG.Event.deposeNode(this.div);
		this.div=null;
	};

	/**
		獲取Id
	*/
	PG.CenterCrossControl.prototype.resetID=function(doc,str,newID){
		var tp = doc.getElementById(str);
		tp.id = newID;
		return tp;
	};

	/**
		顯示控件 
	*/
	PG.CenterCrossControl.prototype.show = function(){
		this.div.style.display = "";
	};

	/**
		隱藏控件
	*/
	PG.CenterCrossControl.prototype.hidden = function(){
		this.div.style.display = "none";
	};
	
	/**
		設置控件透明度
	*/
	PG.CenterCrossControl.prototype.setOpacity = function(opc){
		PG.Tool.setOpacity(this.div,opc);
	};

	/**
		設置控件位置
	*/
	PG.CenterCrossControl.prototype.setPos = function(){
		if(!this.map) return;
		var vs = this.map.GetWindow();
		var hl = vs[0]/2 - this._h_wh[0]/2;
		var ht = vs[1]/2 - this._h_wh[1]/2;
		var vl = vs[0]/2 - this._v_wh[0]/2;
		var vt = vs[1]/2 - this._v_wh[1]/2;
		this.cross_h.style.left = hl + "px"; 
		this.cross_h.style.top = ht + "px"; 
		this.cross_v.style.left = vl + "px"; 
		this.cross_v.style.top = vt + "px"; 	
	};

	/**
		當地圖大小改變時調用,改變PG.CenterCrossControl位置
	*/
	PG.CenterCrossControl.prototype.onRs = function(viewsize){
		this.setPos();
	};
	
	window.PG.CenterCrossControl=PG.CenterCrossControl;
}
NSCenterCrossControl();