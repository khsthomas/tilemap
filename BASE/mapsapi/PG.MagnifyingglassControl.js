/**
	本文件是JS API之中的PG.MagnifyingglassControl類
	每個控件應該有initialize,getObject,depose三個方法
	本類用來設置滾輪縮放時的指示(放大縮小)按鈕

*/
function NSMagnifyingglassControl(){
	function MagnifyingglassControl(config)
	{
		PG.Tool.inherit(this,PG.Control);
		this.div=document.createElement("div");
		this.div._control=this;
		this.div.style.position = "absolute";
		PG.Event.addListener(this.div,"mousedown",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"selectstart",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"click",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		
		this.bSize = [100,70];
		this.sSize = [25,14];
		this._cfg = config||{};
		this.create();
	}
	PG.MagnifyingglassControl = MagnifyingglassControl;

	/**
		創建滾動放大縮小標識(四個角元素)
	*/
	PG.MagnifyingglassControl.prototype.create = function(){
		var str = [];
		var s_size="position:absolute;width:6px;height:4px;font-size:0px;";
		this._cfg.bstyle = this._cfg.bstyle||"2px solid #FF0000";
		var S_b = this._cfg.bstyle+";";
		var s_b_l = "border-left:"+S_b;
		var s_b_t = "border-top:"+S_b;
		var s_b_r = "border-right:"+S_b;
		var s_b_b = "border-bottom:"+S_b;
		str.push("<div id='_PGMF_lt' style='top:0px;left:0px;"+s_size+s_b_l+s_b_t+"'>");
		str.push("</div>");
			
		str.push("<div id='_PGMF_rt' style='top:0px;right:0px;"+s_size+s_b_r+s_b_t+"'>");
		str.push("</div>");
		
		str.push("<div id='_PGMF_lb' style='top:0px;right:0px;"+s_size+s_b_l+s_b_b+"'>");
		str.push("</div>");
		
		str.push("<div id='_PGMF_rb' style='top:0px;right:0px;"+s_size+s_b_r+s_b_b+"'>");
		str.push("</div>");
		var doc = document;
		var tp = doc.createElement("div");
		tp.innerHTML = str.join("");
		
		doc.body.appendChild(tp);
		this.mfg_lt =this.resetID(doc,"_PGMF_lt",""); 
		this.mfg_rt =this.resetID(doc,"_PGMF_rt",""); 
		this.mfg_lb =this.resetID(doc,"_PGMF_lb",""); 
		this.mfg_rb =this.resetID(doc,"_PGMF_rb",""); 
		document.body.removeChild(tp);
		
		this.div.appendChild(this.mfg_lt);
		this.div.appendChild(this.mfg_rt);
		this.div.appendChild(this.mfg_lb);
		this.div.appendChild(this.mfg_rb);
	};

	/**
		初始化控件
	*/
	PG.MagnifyingglassControl.prototype.initialize=function(map)
	{
		this.map=map;
//		註冊map監聽事件
		this.listener=[
			PG.Event.bind(this.map,"OnZoomStart",this,this.onZs),
			PG.Event.bind(this.map,"OnZoomEnd",this,this.onZe),
			PG.Event.bind(this.map,"slidezoom",this,this.onSz)
		];
		this.hidden();
	};

	/**
		返回對像
	*/
	PG.MagnifyingglassControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		刪除
	*/
	PG.MagnifyingglassControl.prototype.remove=function()
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
	PG.MagnifyingglassControl.prototype.depose=function()
	{
		this.div._control=null;
		PG.Event.deposeNode(this.div);
		this.div=null;
	};

	/**
		根據舊Id設置新Id
	*/
	PG.MagnifyingglassControl.prototype.resetID=function(doc,oldID,newID){
		var tp = doc.getElementById(oldID);
		tp.id = newID;
		return tp;
	};

	/**
		顯示
	*/
	PG.MagnifyingglassControl.prototype.show = function(){
		this.div.style.display = "";
	};

	/**
		隱藏
	*/
	PG.MagnifyingglassControl.prototype.hidden = function(){
		this.div.style.display = "none";
	};

	/**
		設置控件透明度
	*/
	PG.MagnifyingglassControl.prototype.setOpacity = function(opc){
		PG.Tool.setOpacity(this.div,opc);
	};

	/**
		設置控件大小
	*/
	PG.MagnifyingglassControl.prototype.SetSize = function(size){
		isNaN(size[0])&&(size[0]=0);
		isNaN(size[1])&&(size[1]=0);
		PG.Tool.SetSize(this.div,size);
	};

	/**
		設置控件位置
	*/
	PG.MagnifyingglassControl.prototype.setPos = function(pos){
		var s = PG.Tool.GetSize(this.div);
		this.div.style.left = pos[0] - s[0]/2 + "px";
		this.div.style.top = pos[1] - s[1]/2 + "px";
	};

	/**
		地圖縮放級別改變時觸發
	*/
	PG.MagnifyingglassControl.prototype.onZs = function(s,e,evt){
		if(!evt){
			return;
		}
		if(this.silid){
			var sIdx = this.map.getZoomIndex(s);
			var eIdx = this.map.getZoomIndex(e);
			this.silid.sIdx = sIdx;
			this.silid.eIdx = eIdx;
			return;
		}
		var isIn = e>s;
//		獲取zoom對應的index
		var sIdx = this.map.getZoomIndex(s);
		var eIdx = this.map.getZoomIndex(e);
		var evtPos = PG.Tool.getEventPosition(evt,this.map.GetContainer());
		if(isIn){//放大
			var sSize = this.sSize;
			var eSize = this.bSize;
			this.setType(1);
		}else{//縮小
			var sSize = this.bSize;
			var eSize = this.sSize;
			this.setType(0);
		}
		if(!this.silid){
			this.silid = {isIn:isIn,sSize:sSize,eSize:eSize,s:s,e:e,sIdx:sIdx,eIdx:eIdx,evtPos:evtPos};
		}
		this.SetSize(sSize);
		this.setPos(evtPos);
		this.show();
	};

	/**
		地圖縮放結束時觸發
	*/
	PG.MagnifyingglassControl.prototype.onZe = function(e){
		this.hidden();
		this.silid = null;
		delete this.silid;
	};

	/**
		在地圖縮放滑動結束時觸發
	*/
	PG.MagnifyingglassControl.prototype.onSz = function(zidx){
		if(!this.silid) return;
		var step = zidx - this.silid.sIdx;
		var scale = step/(this.silid.eIdx-this.silid.sIdx);
		var w = (this.silid.eSize[0] - this.silid.sSize[0])*scale;
		var h = (this.silid.eSize[1] - this.silid.sSize[1])*scale;
		
//		設置控件大小
//		設置控件位置
		var sz = [this.silid.sSize[0]+w,this.silid.sSize[1]+h];
		if(!this.silid.isIn&&sz[0]<this.sSize[0]){
			sz = this.sSize;
		}
		this.SetSize(sz);
		this.setPos(this.silid.evtPos);
		
	};

	/**
		設置類型(放大,縮小)
	*/
	PG.MagnifyingglassControl.prototype.setType=function(t){
		//放大
		if(t===1){
			var s = this.mfg_lt.style;
			s.left = "0px";
			s.top = "0px";
			s.right = "auto";
			s.bottom = "auto";
			s = this.mfg_rb.style;
			s.right = "0px";
			s.bottom = "0px";
			s.top = "auto";
			s.left = "auto";
			s = this.mfg_rt.style;
			s.right = "0px";
			s.top = "0px";
			s.bottom = "auto";
			s.left = "auto";
			s = this.mfg_lb.style;
			s.left = "0px";
			s.bottom = "0px";
			s.top = "auto";
			s.right = "auto";
		}else{
			var s = this.mfg_lt.style;
			s.right = "0px";
			s.bottom = "0px";
			s.left = "auto";
			s.top = "auto";
			s = this.mfg_rb.style;
			s.top = "0px";
			s.left = "0px";
			s.right = "auto";
			s.bottom = "auto";
			s = this.mfg_rt.style;
			s.bottom = "0px";
			s.left = "0px";
			s.right = "auto";
			s.top = "auto";
			s = this.mfg_lb.style;
			s.top = "0px";
			s.right = "0px";
			s.left = "auto";
			s.bottom = "auto";
		}
	};

	window.PG.MagnifyingglassControl=PG.MagnifyingglassControl;
}
	
NSMagnifyingglassControl();