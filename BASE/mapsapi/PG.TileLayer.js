/**
	為保證圖片質量,疊加層一般都是png的
	在地圖上顯示附加256圖片的類
*/
function NSLayer256Overlay(){
	function Layer256Overlay(imageUrl,offset,rotation,opacity,isPng,ErrorImg)
	{
		this.imageUrl=imageUrl;
		this.rotation=-rotation;//旋轉
		this.opacity=(typeof(opacity)=="number")?opacity:1;
		this.listeners=[];
		this.offset=offset;
		//thomas修改
		this.imgSize=(PG._map_imgSize)?PG._map_imgSize:256;
		this.px256 = this;
		this.isPng = isPng?isPng:false;
		this.is_ie6png=this.isIE6()&&this.isPng;	
		this.ErrorImg = ErrorImg;
	}

	PG.Layer256Overlay = Layer256Overlay;

	/**
		初始化
	*/
	PG.Layer256Overlay.prototype.initialize=function(a)
	{
		this.map=a;
		if((this.rotation>5 || this.rotation<-5)&& document.all){
			this.drawElement=document.createElement("v:Image");  //wen  和PG.tool.loadVmlNamespace相關 
			this.drawElement.style.rotation=this.rotation;
		}else{
			if(this.imageUrl==null||(this.is_ie6png)){
				this.drawElement=document.createElement("div");
			}else{
				this.drawElement=document.createElement("img");
			}
		}
		
		this.drawElement.style.position="absolute";
		this.drawElement.style.zIndex=400;
		this.drawElement.galleryImg="no";  // wen 消除ie6自動出現的圖像工具欄
		this.setImg();
		this.setOpacity(this.opacity);
		PG.Tool.setUnSelectable(this.drawElement);
		this.drawElement.style.border="0px";
		this.drawElement.style.padding="0px";
		this.drawElement.style.margin="0px";

		var flag =(this.imageUrl==null||(this.is_ie6png));		
		if(!flag){
			var handle = PG.Event.bind(this.drawElement,"error",this,this.onerror);
			this.listeners.push(handle);
		}
		
		var handle = PG.Event.bind(this.drawElement,"contextmenu",this,PG.Tool.falseFunction);
		this.listeners.push(handle);
	};

	/**
		確保PNG圖片在IE6下正常顯示
	*/
	PG.Layer256Overlay.prototype.setImg = function(){
		if(this.imageUrl!=null){
			if(this.is_ie6png){
				this.drawElement.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this.imageUrl+"',sizingMethod='crop')";
				this.drawElement.style.width=this.imgSize+"px";
				this.drawElement.style.height=this.imgSize+"px";
			}else{
				this.drawElement.src=this.imageUrl;
			}
		} 
	};

	/**
		重設圖片
	*/
	PG.Layer256Overlay.prototype.resetImg = function(url){
		this.imageUrl = url;
		this.setImg();
	};

	/**
		刪除 
	*/
	PG.Layer256Overlay.prototype.remove=function()
	{
		this.map=null;
		var listener;
		while(listener=this.listeners.pop()){
			PG.Event.removeListener(listener);
		}	
	};

	/**
		銷毀
	*/
	PG.Layer256Overlay.prototype.dispose = function()
	{
		var listener;
		while(listener=this.listeners.pop()){
			PG.Event.removeListener(listener);
		}
		PG.Event.deposeNode(this.drawElement);
		this.imageUrl=null;
		this.rotation=null;
		this.opacity=null;
		this.drawElement=null;
		this.map=null;
		this.listeners=null;
	};

	/**
		加載地圖瓦片出錯時觸發 
	*/
	PG.Layer256Overlay.prototype.onerror=function()
	{
			this.drawElement.src=this.ErrorImg;
			while(listener=this.listeners.pop())
			{
				PG.Event.removeListener(listener);
			}
	};

	/**
		返回對像
	*/
	PG.Layer256Overlay.prototype.getObject=function()
	{
		return this.drawElement;
	};

	/**
		設置位置
	*/
	PG.Layer256Overlay.prototype.setOffset=function(offset,a)
	{
		this.offset = offset;
		this.reDraw(a);
	};

	/**
		重新繪製
		重新加載所有添加到此 PG.TileLayer 的可見圖塊
	*/
	PG.Layer256Overlay.prototype.reDraw=function(a) 
	{
		if(!a)return;
		var offset=this.offset;
		var id=this.id;
		var position=[(id[0]*this.imgSize)+parseInt(offset[0]),(id[1])*this.imgSize+parseInt(offset[1])];
		this.drawElement.style.left=position[0]+"px";
		this.drawElement.style.top=position[1]+"px";
		this.drawElement.style.width=this.imgSize+"px";
		this.drawElement.style.height=this.imgSize+"px";
	};

	/**
		設置透明度
	*/
	PG.Layer256Overlay.prototype.setOpacity=function(opacity)
	{
		if(!opacity||typeof(opacity)!="number"){return;}
		if(this.is_ie6png){return;}
		this.opacity=opacity;
		this.drawElement.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity="+(this.opacity*100)+");";
		this.drawElement.style.MozOpacity=this.opacity;
		this.drawElement.style.opacity = opacity;
	};

	/**
		判斷是否為IE6
	*/
	PG.Layer256Overlay.prototype.isIE6=function(a)
	{
		return PG.Tool.browserInfo().isIE6;
	};

	/**
		將Google地圖和mapenjoy網的地圖進行同步合併的地圖

		參數config 是一個對像({}),屬性如下:
		isPng,opacity,tileUrlTemplate,ErrorImg,minResolution,maxResolution,zIndex,getTileUrl
	*/
	function TileLayer(config) 
	{		
		//	{opacity:opacity,onImgCall:handle}
		//opacity是透明度,getTileUrl是鉤子(獲取圖片的時候會被調用,參數有三個,依次為x,y,z.水平塊數,垂直塊數和縮放等級,其實不能叫鉤子...),
		//config.imgURLs為圖片url地址,比getTileUrl優先級高   config.map_staticFileType
		this.config = config?config:{};
		this._isPng  = this.config.IsPng?this.config.IsPng:false;
		this.config.opacity = this.config.Opacity?this.config.Opacity:1;
		this._tileUrlTemplate = this.config.TileUrlTemplate?this.config.TileUrlTemplate:"";
		this._minResolution = this.config.MinLevel?this.config.MinLevel:Number.MIN_VALUE;
		this._maxResolution = this.config.MaxLevel?this.config.MaxLevel:Number.MAX_VALUE;
		this._zindex = this.config.ZIndex?this.config.ZIndex:101;
		this.ErrorImg = this.config.ErrorImg?this.config.ErrorImg:window.PG._ltErrorImgURL;
			

		var opacity = this.config.opacity; 
		this.opacity=typeof(opacity)=="number"?opacity:1; 
		this.images=[];
		this.times=0; 
		this.bIsShow=true;
		//默認疊加交通
		this.extName="";  //.jpg .png
		this.imgURLs = "";
		this.overlays256Div=document.createElement("div");
		PG.Tool.setCssText(this.overlays256Div,"position:absolute;left:0px;top:0px;z-index:"+this._zindex+";");
		this.isKeep = false;
	}
	PG.TileLayer = TileLayer;

	/**
		初始化
	*/
	PG.TileLayer.prototype.initialize = function(map){
		this.bind(map);
	};

	/**
		返回容器節點
		獲取包含圖片層的div對像
	*/
	PG.TileLayer.prototype.GetObject = function(){    
		return this.overlays256Div;
	};

	/**
		刪除 
	*/
	PG.TileLayer.prototype.remove = function(){
		this.removeListener();
		this.hideImages();
		this.ltmaps=null;
		PG.Event.removeListener(this.verifyZoomLevelHandle);
		this.verifyZoomLevelHandle = null;
	};

	/**
		重新加載圖片,如果是png,則依然假設是PNG,否則效率和重新疊加一個圖層一樣
	*/
	PG.TileLayer.prototype.reDraw = function(){
		//設定img src的url
		for(var i=0;i<this.images.length;i++){
			var o = this.images[this.images[i]];
			var gimgurl=this.getTileUrl(o.id[0],o.id[1],this.ltmaps.zoomLevels[o.id[2]]);
			o.resetImg(gimgurl);
		}
		this.resetImages();
	};

	/**
		重新加載所有添加到此 PG.TileLayer 的可見圖塊
	*/
	PG.TileLayer.prototype.Refresh = function(){  
		this.reDraw();
	};

	/**
		隱藏此疊加層使之不可見,但保留它在疊加層堆棧中的位置.
	*/
	PG.TileLayer.prototype.Hide = function(){ 
		this.setVisible(false);
	};

	/**
		如果圖塊層疊加層不可見,則返回 true.否則,返回 false
	*/
	PG.TileLayer.prototype.IsHidden = function(){
		return this.showLayer;
	};

	/**
		顯示先前不可見的PG.TileLayer
	*/
	PG.TileLayer.prototype.Show = function(){     
		this.setVisible(true);
	};

	/**
		返回圖塊的圖像格式是否為 PNG
	*/
	PG.TileLayer.prototype.IsPng = function(){     
		return this._isPng;
	};

	/**
		返回圖塊層的最低縮放級別.
	*/
	PG.TileLayer.prototype.GetMinLevel = function(){
		return this._minResolution;
	};

	/**
		返回圖塊層的最高縮放級別.
	*/
	PG.TileLayer.prototype.getMaxLevel = function(){
		return this._maxResolution;
	};

	/**
		設置取圖函數.(重置默認的函數PG.TileLayer.prototype.getTileUrl)
	*/
	PG.TileLayer.prototype.SetGetTileUrl = function(handle){
		this.config.getTileUrl = handle;
		//TileLayer.getTileUrl會在PG.Mas.js呼叫到
		this.getTileUrl = this.config.getTileUrl;
		this.resetImages();
	};

	/**
		設置是否clearLayers的時候是否保持
	*/

	PG.TileLayer.prototype.setKeep = function(flag){
		this.isKeep = flag;
	};

	/**
		返回clearLayers的時候是否保持
	*/
	PG.TileLayer.prototype.getKeep = function(){
		return this.isKeep;
	};

	/**
		標注層的z-index是500,因此不可大於500,或者重設標注層的z-index 方法setOverLayZIndex
	*/
	PG.TileLayer.prototype.SetZindex = function(zindex){
		this.getObject().style.zIndex = zindex;
	};

	/**
		綁定圖層
		ltmap即PG.Map
		在圖層所在的div插入
	*/
	PG.TileLayer.prototype.bind=function(ltmaps){
		this.ltmaps=ltmaps;
		this.addListener();
		this.ltmaps.mapsDiv.appendChild(this.overlays256Div);
	};

	/**
		銷毀或關閉窗口時觸發
	*/
	PG.TileLayer.prototype.onWinUnload=function(){
		try{
			this.hideImages();
			if(this.overlays256Div.parentNode){
				this.overlays256Div.parentNode.removeChild(this.overlays256Div);
			}
			this.ltmaps=null;
			this.remove();
		}catch(e){
			
		}
	};

	/**
		地圖縮放開始時執行的函數
	*/
	PG.TileLayer.prototype.onMapZoomStart=function(zstart,zoome){
		this.overlays256Div.style.display="none";
	};

	/**
		地圖縮放結束時執行的函數
	*/
	PG.TileLayer.prototype.onMapZoomEnd=function(zoome){
		var imgNums=this.images.length;
		for(var i=imgNums-1;i>=0;i--)
		{
			var imgid=this.images[i];
			if(this.ltmaps.zoomLevels[this.images[imgid].id[2]] != zoome){
				this.remove256OverLay(this.images[imgid],true);
				PG.Tool.deleteFromArray(this.images,imgid);
				this.images[imgid]=null;
				delete this.images[imgid];
			}
		}
		
		this.overlays256Div.style.display="";
	};

	/**
		驗證地圖縮放的級別是否合法
	*/
	PG.TileLayer.prototype.verifyZoomLevel=function(zoome){
		if(this._minResolution<=zoome<=this._maxResolution){
			this.addListener();
		}else{
			this.removeListener();
		}	
	};

	/**
		設置透明度
	*/
	PG.TileLayer.prototype.SetOpacity=function(opacity){
		if(this.opacity==opacity || opacity<0 || opacity>1){return;}

		this.opacity=opacity;
		for(var i=0;i<this.images.length;i++)
		{
			this.images[this.images[i]].setOpacity(opacity);
		}
	};

	/**
		提供外部控制256隱藏的接口
	*/	
	PG.TileLayer.prototype.hideImages=function()
	{		
		var imgNums=this.images.length;
		
		for(var i=imgNums-1;i>=0;i--)
		{
			this.remove256OverLay(this.images[this.images[i]],true);
			this.images[this.images[i]]=null;
			delete this.images[this.images[i]];
			this.images[i]=null;
			this.images.pop();
		}
		this.bIsShow=false;
	};

	/**
		提供外部控制256顯示的接口
	*/	
	PG.TileLayer.prototype.resetImages=function()//
	{
		if(!this.ltmaps) return;
		this.bIsShow=true;
		this.ltmaps.moveMapImages(true);
	};

	/**
		顯示圖片
	*/	
	PG.TileLayer.prototype.onImgShow = function(id,offset,flag){
		if(this.bIsShow==false){
			return;
		};
		var imgname = "_"+id[0]+"_"+id[1]+"_"+id[2];
		if(this.images[imgname])
		{//如果存在則重繪
			if(flag)
			{
				this.images[imgname].setOffset(offset,true);
			}
		}else{
			//"_"+id[0]+"_"+id[1]+"_"+id[2]; 對應 _x_y_z;
			var gimgurl=this.getTileUrl(id[0],id[1],this.ltmaps.zoomLevels[id[2]]);
			this.images[imgname]=new PG.Layer256Overlay(gimgurl,offset,null,this.opacity,this._isPng,this.ErrorImg);
			this.images[imgname].id = id;
			this.images.push(imgname);
			this.add256OverLay(this.images[imgname]);
		}
		//OnShowImg和OnHiddenImg遵守的一個原則:觸發事件的時候,對像已經建立
		PG.Event.trigger(this,"OnShowImg",[id,flag]);
	};

	/**
		顯示圖片
	*/
	PG.TileLayer.prototype.onImgHidden = function(id){
		PG.Event.trigger(this,"OnHiddenImg",[id]);
		if(this.bIsShow==false){
			return;
		};
		var imgname = "_"+id[0]+"_"+id[1]+"_"+id[2];
		this.remove256OverLay(this.images[imgname],true);
		//從標注數組之中刪除標注
		PG.Tool.deleteFromArray(this.images,imgname);
		this.images[imgname]=null;
		delete this.images[imgname];
	};

	/**
		返回塊號對應的html對像,可能是div或者image,注意操作完這個對象以後解除所有引用防止內存洩漏.
	*/
	PG.TileLayer.prototype.GetImg = function(x,y,z){ 
		var imgname = "_"+x+"_"+y+"_"+z;
		if(this.images[imgname]){
			return this.images[imgname].getObject();
		}
	};

	/**
		返回包含所有image的一個對像,通過對象的id可以取到塊號,通過getObject()可以得到image或者div.
	*/
	PG.TileLayer.prototype.GetAllImg = function(){  
		if(this.images){
			return this.images;
		}
	};

	/**
		得到圖塊層圖片地址, 這裡是左上角(換日線)為原點計算
	*/
	PG.TileLayer.prototype.getTileUrl=function(bx,by,zoom)
	{
		if(this.ltmaps){
			bx = this.ltmaps.toSpanXLegal(bx);
		}
		//var nGrade=Math.ceil((12-zoom)/4);
		var nGrade=Math.ceil((zoom-3)/4);
		var nPreRow=0,nPreCol=0,nPreSize=0;  
		var path="";
		for(var i=0;i<nGrade;i++)
		{
			//每級最大網格數為  16* 16 = 256(相關於子目錄數和文件數)
			var nSize=1<<(4*(nGrade-i));//計算當前目錄包括的單元數(網格距離）
			var nRow =parseInt((bx-nPreRow*nPreSize)/nSize);  //得到行，列值
			var nCol =parseInt((by-nPreCol*nPreSize)/nSize);
			path+=((nRow>9)?nRow:"0"+nRow)+""+((nCol>9)?nCol:"0"+nCol)+"/";
			nPreRow = nRow;
			nPreCol = nCol;
			nPreSize = nSize;
		}
		if(this._tileUrlTemplate!=""){
			return this._tileUrlTemplate.replace("{X}", x).replace("{Y}", y).replace("{Z}", z);
		}else{
			var imgURLs=this.imgURLs;
			var id=(((bx)&((1<<20)-1))+(((by)&((1<<20)-1))*Math.pow(2,20))+(((zoom)&((1<<8)-1))*Math.pow(2,40)));
			return imgURLs+"/"+zoom+"/"+path+id+this.extName;
		}
	};

	/**
		採用這兩個方法將疊加層添加到另一個層上
	*/
	PG.TileLayer.prototype.add256OverLay=function(overlay,keep)
	{
		if(overlay.initialize(this.ltmaps)==false){return false;}
		var obj=overlay.getObject();
		if(obj)
		{
			this.overlays256Div.appendChild(obj);
			//在overlay層之下
			//if(obj.style.zIndex==0){PG.Tool.setZIndex(obj,500);}
		}
		overlay.reDraw(true);
		PG.Event.trigger(overlay,"add",[this.ltmaps]);
		overlay._keep=keep;
	};

	/**
		刪除
	*/
	PG.TileLayer.prototype.remove256OverLay=function(overlay,dispose)
	{
		if(!overlay){return;}
		if(overlay.remove){overlay.remove();}
		var obj=overlay.getObject();
		if(obj && obj.parentNode)
		{
			obj.parentNode.removeChild(obj);
		}
		PG.Event.trigger(overlay,"remove",[]);
		if(dispose && overlay.dispose){overlay.dispose();}
	};

	/**
		銷毀創建的layer
	*/	
	PG.TileLayer.prototype.Dispose = function(){   //銷毀創建的layer
		this.onWinUnload();
	};

	/**
		設置圖層是否可見
	*/
	PG.TileLayer.prototype.setVisible = function(show){
		this.showLayer = show;
		if(!this.showLayer){
			this.overlays256Div.style.display = "none";
			//不再持續拿圖
			this.removeListener();
			//徐金評 1/9
			this.hideImages();
		}else{
			this.overlays256Div.style.display = "";
			this.addListener();
			//徐金評 1/9
			this.resetImages();
		}	
	};

	/**
		刪除註冊的監聽事件
	*/
	PG.TileLayer.prototype.removeListener = function(){    
		PG.Event.removeListener(this.showimghandle);
		this.showimghandle = null;
		PG.Event.removeListener(this.hiddenimghandle);
		this.hiddenimghandle = null;
		PG.Event.removeListener(this.zoomstarthandle);
		this.zoomstarthandle = null;
		PG.Event.removeListener(this.zoomendhandle);
		this.zoomendhandle = null;
	};

	/**
		添加監聽事件至圖台上
	*/
	PG.TileLayer.prototype.addListener = function(){
		if(!this.showimghandle){
			this.showimghandle = PG.Event.bind(this.ltmaps,"OnShowImg",this,this.onImgShow);
			this.hiddenimghandle = PG.Event.bind(this.ltmaps,"OnHiddenImg",this,this.onImgHidden);
			this.zoomstarthandle = PG.Event.bind(this.ltmaps,"OnZoomStart",this,this.onMapZoomStart);
			if(!this.verifyZoomLevelHandle){
				this.verifyZoomLevelHandle = PG.Event.bind(this.ltmaps,"OnZoomStart",this,this.verifyZoomLevel);//監視比例尺
			}
			this.zoomendhandle = PG.Event.bind(this.ltmaps,"OnZoomEnd",this,this.onMapZoomEnd);
		}
	};

	/**
		克隆圖層
	*/
	PG.TileLayer.prototype.clone = function(){
		var layer = new PG.TileLayer(this.config);
		if(this.getTileUrl!=PG.TileLayer.prototype.getTileUrl){
			layer.SetGetTileUrl(this.getTileUrl);
		}
		layer.getImgUrl = this.getImgUrl;
		layer.getExtName = this.getExtName;
		return layer;
	};

	/**
		用戶覆蓋這兩個方法,返回自己需要的圖片url和後綴名
	*/
	PG.TileLayer.prototype.getImgUrl = function(){
		return this.imgURLs;
	};

	/**
		返回擴展名
	*/
	PG.TileLayer.prototype.getExtName = function(){
		return this.extName;
	};

	window.PG.TileLayer=PG.TileLayer;
	window.PG.Layer256Overlay=PG.Layer256Overlay;
}
NSLayer256Overlay();
