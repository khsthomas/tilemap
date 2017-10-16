/**
	本文件是JS API之中的PG.Map對像
	PG.Map.prototype.getMapImagesUrl 就是pilotgaea預設取圖的方法
	this.config.mapTypes
	this.config.draggableCursor
	this.config.draggingCursor
	this.config.backgroundColor
*/
function MapNSMap()
{
	function Map(container,config)
	{
		//初始化Container,document.all 只有ie支持, 開啟圖片快取
		if(document.all){try{document.execCommand("BackgroundImageCache", false, true);}catch(e){}}
		this.container=(typeof(container)=="object")?container:document.getElementById(container);
		if(!this.container){alert('沒有傳入用來顯示地圖的層');return;}
				
		//記錄container層內的內容
		//wen 存入container以前的東西,加載地圖後,就沒有以前的了
		this.originChildren=[];
		var child;
		while(child=this.container.firstChild)
		{
			this.originChildren.push(child);
			this.container.removeChild(child);
		}	
		
		this.container.align="left";
		this.mapCursor=["default","move"];
		var style=this.container.style;
		if(style.position!="absolute"){style.position="relative";}
		PG.Tool.setUnSelectable(this.container);
		style.overflow="hidden";
		if(window.PG._map_bgImg){this.setBgImage(window.PG._map_bgImg);}
		
		var viewSize=this.getContainerSize();//獲得Container大小
		PG.Event.addListener(this.container,"contextmenu",PG.Event.cancelBubble);   //不明白 王耀武
		
		//瓦片大小
		this.imgSize=window.PG._map_imgSize;//256;
		
		//縮放級別
		this.zoomLevels=window.PG._map_zoomLevels;
		/*
			地圖滑動時每次滑動的像素(參見PG.Map.slide)
			有兩種基本變換情況:
			1,地圖中心點變化.在這種情況下,會計算出當前中心點到目標中心點之間的距離,
								然後根據這個值慢慢變化到目標中心點
			2,地圖級別變化.在這種情況下,會根據當前級別慢慢變換到目標級別
		*/
		this.slideNum=12;
		//地圖滑動時執行PG.Map.slide的時間間隔 
		this.slideIntervalTime=35;
		//縮放時是否顯示滑動效果
		this.isZoomSlide = true;
		/*
			當點擊骨頭棒控件的滑動條時,如果點擊處的級別和當前級別的差值小於
			window.PG._map_slideMaxZoom,則有滑動效果,都在沒有滑動效果
		
		*/
		this.slideMaxZoom=typeof(window.PG._map_slideMaxZoom)=="number"?window.PG._map_slideMaxZoom:4;

		
		this.config = config?config:{};
		//PG.NORMAL_MAPimgURLs定義在maps_config.js
		this.imgURLs=window.PG.NORMAL_MAPimgURLs;
		this.errorImgUrl=window.PG._ltErrorImgURL;		
		
		//初始化各層
		this.overlays=new Array(0);		//用來保存在地圖添加的所有疊加物對像 
		this.p_overlays=new Array(0);	//用來保存在地圖加載之前被添加到地圖上的所有疊加物對像 
		this.controls=new Array(0);		//用來保存在地圖添加的所有控件類對像 
		this.layersAry=new Array(0);	//用來保存在地圖添加的所有圖層對像(不含MapType)
		this.p_layersAry=new Array(0);	//用來保存在地圖加載之前添加到地圖上的layer,還沒實現
		this.canDrag=true;

		//mapsDiv是用來放置地圖圖片的層,overlaysDiv所在的因為要隨著地圖移動,也放置到mapsDiv之中
		this.mapsDiv=PG.Tool.createDiv(1,null,100);
		PG.Tool.setCursorStyle(this.mapsDiv,this.mapCursor[0]);
		PG.Tool.setCursorStyle(this.container,this.mapCursor[0]);
		PG.Tool.setUnSelectable(this.mapsDiv);
		var style=this.mapsDiv.style;
		style.overflow="visible";
		this.container.appendChild(this.mapsDiv);

		//背景色顏色圖層
		var maskDiv=PG.Tool.createDiv(1,null,180);
		PG.Tool.SetSize(maskDiv,["100%","100%"]);
		maskDiv.style.backgroundImage="url("+window.PG._map_maskBackgroundURL+")";
		PG.Tool.setUnSelectable(maskDiv);
		this.mapsDiv.appendChild(maskDiv);
		this.maskDiv=maskDiv;
		
		//放maplayer圖層的層,每一個地圖級別都有一個層,this.mapLayerDiv存放加載了的所有級別層
		//也就是說有18個地圖級別,也就有18個地圖級別層,每個層存放對應的地圖瓦片
		this.mapLayerDiv=PG.Tool.createDiv(1,null,1);
		PG.Tool.setUnSelectable(this.mapLayerDiv);
		var style=this.mapLayerDiv.style;
		style.overflow="visible";
		this.mapsDiv.appendChild(this.mapLayerDiv);

		//用來放所有疊加物對象的層
		this.overlaysDiv=PG.Tool.createDiv(1,null,500);
		PG.Tool.setUnSelectable(this.overlaysDiv);
		var style=this.overlaysDiv.style;
		style.overflow="visible";
		this.mapsDiv.appendChild(this.overlaysDiv);
		
		//地圖的事件捕獲
		this.bInfo = PG.Tool.browserInfo();
		var evt = "mousedown";
		if(this.bInfo.isMwk){evt = "touchstart";}
		PG.Event.bind(this.container,"dblclick",this,this.onDoubleClick);
		PG.Event.bind(this.container,evt,this,this.onMouseDown);
		PG.Event.bind(this.container,"mousemove",this,this.onContainerMouseMove);
		PG.Event.bind(this.container,"click",this,this.onClick);
		PG.Event.bind(window,"resize",this,this.AdjustLayout);
		PG.Event.bind(window,"move",this,this.AdjustLayout);
		PG.Event.bind(window,"load",this,this.AdjustLayout);
		//ff下縮放時隱藏overlay層,用visibility是為了防止infowin大小計算出錯
		PG.Event.bind(this,"OnZoomStart",this,function(){this.overlaysDiv.style.visibility="hidden"});
		PG.Event.bind(this,"OnZoomEnd",this,function(){this.overlaysDiv.style.visibility="inherit"});

		this.setViewSize(viewSize);

		//緩存圖片數量
		var bufferNumber=(typeof(window.PG._map_bufferNumber)=="number")?window.PG._map_bufferNumber:500;
		if(this.bInfo.isMwk){bufferNumber = 30;this.moveFast();}
		//創建地圖瓦片管理器
		this.tileMgr=new PG.MapTileMgr(this,this.imgSize,bufferNumber);
		this.maxPixel=5000;
		this.dbclickToCenter=true;
		setTimeout(PG.Event.getCallback(this,this.checkContainer),5000);		
		this.imgTotalNumber = 0;//記錄圖像總數
		
		var logoFlag=true;
		//如果是鷹眼地圖,將logoFlag改為false
		try{if(PG.Map.caller.arguments[0].constructor==PG.Map){logoFlag=false;}}catch(e){}
		//如果不是鷹眼地圖,加載進度條和logo
		if(logoFlag)
		{			
			this.progress=new PG.ProgressControl();
			this.AddControl(this.progress);//添加進度條
						
			if(PG.BseiDigControl)
			{//添加審圖號
				this.rblogo = new PG.BseiDigControl();
				this.AddControl(this.rblogo);
			}	
			
			if(PG.LogoControl)
			{//添加LOGO
				this.logoControl=new PG.LogoControl(window.PG.Logo_Control_str);
				this.AddControl(this.logoControl);
			}
			//觸發ltmapscreate event
			PG.Event.trigger(window,"ltmapscreate",[this]);
		}		  
				  
		//級別為0時的分辨率(一個像素代表多少米)
	  	this.maxResolution = window.PG._MaxResolution;
		this.minResolutionX = window.PG._MinXResolution;
		this.minResolutionY = window.PG._MinYResolution;		
		this._baseX = window.PG._baseX;
		this._baseY = window.PG._baseY;
		/*
			地圖最大縮放級別---和計算比例尺有關
			
			所切圖的最大級別,切圖的級別不同,分辨率也會不同

			window.PG._MaxXResolution = 0.5971642833709717;
			window.PG._MaxYResolution = 0.5971642833709717;	
			window.PG._baseX		  = -156543.0339*128;
			window.PG._baseY		  = -156543.0339*128;
			window.PG._MaxZoomLevel   = 18;
			window.PG._maxResolution  = 156543.0339;

		*/
		this._maxLevel = window.PG._MaxZoomLevel;
		  
		//地圖類型
		/*
		if(this.config.mapTypes){
			this.mapTypes = this.config.mapTypes;
			this.defaultType = this.config.mapTypes;//window.PG.NORMAL_MAP;   //默認地圖類型
		}else{
			while(!window.PG.DEFAULT_MAP_TYPES){
				this.sleep(1000);
			}
			this.mapTypes = window.PG.DEFAULT_MAP_TYPES.concat();
			this.defaultType = window.PG.NORMAL_MAP;   //默認地圖類型
		}
		*/
		this.mapTypes = this.config.mapTypes?this.config.mapTypes:window.PG.DEFAULT_MAP_TYPES.concat();		
		this.defaultType = window.PG.NORMAL_MAP;   //默認地圖類型
		this._tileUrlTemplate = "";
		
		//設置光標在地圖上時的手型
		this.SetMapCursor(window._map_cur[0],window._map_cur[1]);
		if(this.config.draggableCursor){this.SetMapCursor(this.config.draggableCursor,this.mapCursor[1]);}
		if(this.config.draggingCursor){this.SetMapCursor(this.mapCursor[0],this.config.draggingCursor);}
		if(this.config.backgroundColor){this.SetMapCursor(this.config.backgroundColor);}//容器背景顏色

		this.EnableDoubleClickZoom();

		//設置滾輪向上(1)時為放大或向下(非1)時為縮放
		this.ZoomByMouseWheel_WheelUpDown = 1;
		
		//全圖視景的經緯度範圍
		this.ZoomAllRange = null;
		this.hasSetRange = false;
		
		this.init();//觸屏用到
	}
	PG.Map = Map;
	
	/**
		地圖初始化函數  
	*/
	PG.Map.prototype.init = function(){};

	/**
		返回地圖容器所屬的document對像  
	*/
	PG.Map.prototype.getDocument=function(){
		return this.container.ownerDocument?this.container.ownerDocument:document;
	};

	/**
		設置地圖類型 衛星影像 add chaiqi 20090107   

		默認有三種地圖類型

		mapType: PG.MapType
		(參考PG.MapTypeControl.prototype.setMapTypeByNum)
	*/
	PG.Map.prototype.SetMapType=function(mapType){
		this.blurType(this.defaultType);	
		this.defaultType=mapType;		
		this.focusType(this.defaultType);		
		PG.Event.trigger(this,"OnChangeMaptype",[mapType]);		
	};
	
	/**
		切換地圖類型時執行

		type: PG.MapType
	*/
	PG.Map.prototype.focusType = function(type){
		var lys = type.GetTileLayers();

		//判斷是否為PG.TileLayer.prototype.getTileUrl
		//否則用PG.Map的SetGetTileUrl方法重置預設的 getMapImagesUrl
		if(lys[0].getTileUrl!=PG.TileLayer.prototype.getTileUrl){	
			this.SetGetTileUrl(lys[0].getTileUrl);
		}else{	
			this.SetGetTileUrl(PG.Map.prototype.getMapImagesUrl);
			this._tileUrlTemplate = lys[0]._tileUrlTemplate;
		}
		this.getImgUrl = lys[0].getImgUrl;
		this.getExtName = lys[0].getExtName;
		this.Refresh();

		//如果為混合地圖類型,則地圖需要再加上混合層(在一個mapType有好幾層layer)
		//mp_lys為hybridLayer(參考PG.MapType.init)
		var keep;
		for(var i=lys.length-1;i>0;i--){	
			var l = lys[i].clone();
			this.AddLayer(l,keep,true);//添加混合地圖類型
			//mp_lys為maptype array, 加入陣列
			if(!this.mp_lys){this.mp_lys = [];}
			this.mp_lys.push(l);
		}
	};

	/**
		切換地圖類型執行
	*/
	PG.Map.prototype.blurType=function(type){
		//刪除之前MapType圖層this.mp_lys是layer陣列
		if(this.mp_lys){
			var l;
			while(l = this.mp_lys.pop()){this.RemoveLayer(l,true);}
		}
		this.SetGetTileUrl(PG.Map.prototype.getMapImagesUrl);
		this._tileUrlTemplate = "";
		this.getImgUrl = PG.Map.prototype.getImgUrl;
		this.getExtName = PG.Map.prototype.getExtName;
	};

	/**
		添加地圖類型
	*/
	PG.Map.prototype.AddMapType=function(type){
		this.mapTypes.push(type);
		PG.Event.trigger(this,"AddMaptype",[type]);
	};

	/**
		刪除地圖類型
	*/
	PG.Map.prototype.RemoveMapType=function(type){
		var flag = false;
		for(var i=0;i<this.mapTypes.length;i++){
			if(this.mapTypes[i]==type&&type==this.defaultType){flag = true;}
			if(this.mapTypes[i]==type){this.mapTypes.splice(i,1);}
		}
		if(flag&&this.mapTypes.length>0){
			this.blurType(type);
			this.SetMapType(this.mapTypes[0]);
		}
		PG.Event.trigger(this,"RemoveMaptype",[type]);
	};

	/**
		得到當前的地圖類型
	*/
	PG.Map.prototype.GetCurrentMapType=function(){
		return this.defaultType;
	};

	/**
		得到當前地圖所有類型
	*/
	PG.Map.prototype.GetMapTypes = function(){
		return this.mapTypes;
	};

	/**
		在地圖運行1秒之後檢查地圖是否正常
		如果正常,則清除地圖容器container內原有內容
	*/
	PG.Map.prototype.checkContainer=function()
	{
		if(this.originChildren==0 || this.mapsDiv.style.visibility!="hidden"){return;}
		var child;
		while(child=this.originChildren.shift())
		{
			this.container.appendChild(child);
		}
	};

	/**
		地圖容器container大小(寬度或高度)變化後,重新配置地圖
	*/
	PG.Map.prototype.AdjustLayout=function()
	{
		var size=this.getContainerSize();
		if(size[0]==99 && size[1]==99){setTimeout(PG.Event.getCallback(this,this.AdjustLayout),1000)}
		if(this.viewSize && size[0]==this.viewSize[0] && size[1]==this.viewSize[1]){return;}
		this.setViewSize(size);
		this.loaded=false;
		if(this.centerPoint && typeof(this.zoom)=="number")
		{
			this.centerAndZoom(this.centerPoint,this.zoom);
		}
	};

	/**
		墨卡托轉經緯度
	*/
	PG.Map.prototype.MercatorToLngLat=function(lng,lat)
	{
		var lnglatMin=PG.Tool.inverseMercator(lng,lat);
		var XNTU=parseInt(lnglatMin[0]*100000);
		var YNTU=parseInt(lnglatMin[1]*100000);
		return new PG.Point(XNTU,YNTU,false);
	};

	/**
		返回地圖容器container對像,一般是個DIV
	*/
	PG.Map.prototype.GetContainer=function()
	{
		return this.container;
	};

	/**
		返回比例尺zoom在默認數組中的下標,若不在範圍之內則返回-1
	*/
	PG.Map.prototype.getZoomIndex=function(zoom)
	{
		zoom=parseInt(zoom);
		for(var i=0;i<this.zoomLevels.length;i++)
		{
			if(this.zoomLevels[i]==zoom){return i;}
		}
		return -1;
	};
	
	/**
		設置地圖的顏色和透明度----將顏色的層添加到地圖
	*/
	PG.Map.prototype.SetMapColor = function(color,opacity){
		if(!this.maskColorDiv){this.maskColorDiv = PG.Tool.createDiv(1,null,110);}
		var cp = this.centerPoint;
		var zu = this.getZoomUnits(this.zoom,true);
		var ac = this.areaCenter;
		var position=[this.viewSize[0]/2-(cp.MercatorLng-ac.MercatorLng)/zu[0],this.viewSize[1]/2+(cp.MercatorLat-ac.MercatorLat)/zu[1]];
		PG.Tool.setPosition(this.maskColorDiv,[-position[0],-position[1]]);
		this.mapLayerDiv.appendChild(this.maskColorDiv);
		PG.Tool.SetSize(this.maskColorDiv,this.viewSize);
		this.maskColorDiv.style.background = color;
		if(!opacity){opacity = 0.5;}
		PG.Tool.setOpacity(this.maskColorDiv,opacity);
	};

	/**
		刪除所設置地圖的顏色	
	*/
	PG.Map.prototype.removeMapColor = function(){
		if(this.maskColorDiv){
			this.mapLayerDiv.removeChild(this.maskColorDiv);
			this.maskColorDiv = null;
		}
	};

	/**
		設置地圖縮放級別	
	*/
	PG.Map.prototype.SetZoomLevels=function(lvs){
		this.zoomLevels = lvs;
		PG.Event.trigger(this,"OnSetZoomLevels",[lvs]);
	};

	/**
		得到地圖容器的大小	
	*/
	PG.Map.prototype.getContainerSize=function()
	{
		return PG.Tool.GetSize(this.container);
	};

	/**
		重新設置地圖大小
		參數viewSize是一個數組[width,height]
		
	*/
	PG.Map.prototype.setViewSize=function(viewSize)
	{
		PG.Tool.SetSize(this.overlaysDiv,[viewSize[0],0]);
		PG.Tool.SetSize(this.maskDiv,viewSize);	
		//maskColorDiv為所設置的地圖顏色層(參考SetMapColor方法)
		if(this.maskColorDiv){
			PG.Tool.SetSize(this.maskColorDiv,viewSize);
		}		
		this.viewSize=viewSize;
		PG.Event.trigger(this,"OnResize",[viewSize]);
	};

	/**
		得到地圖的縮放級別

	*/
	PG.Map.prototype.GetWindow=function()
	{
		var vs = new PG.Size(this.viewSize[0],this.viewSize[1]);
		vs[0] = this.viewSize[0], vs[1] = this.viewSize[1];
		return vs;
	};

	/**
		得到地圖的中心點
	*/
	PG.Map.prototype.GetCenter=function()
	{
		return this.centerPoint;
	};

	/**
		得到地圖的縮放級別
	*/
	PG.Map.prototype.GetZoomLevel=function()
	{
		return this.zoom;
	};

	/**
		返回顯示的地圖瓦片數量
	*/
	PG.Map.prototype.getImgNumber=function()
	{
		return this.tileMgr.imgNumber;
	};

	/**
		返回成功加載的地圖圖片數量
	*/
	PG.Map.prototype.getTotalImgNumber=function()
	{
		return this.imgTotalNumber;
	};

	/**
		返回失敗加載的地圖圖片數量
	*/
	PG.Map.prototype.getErrorImgNumber=function()
	{
		return this.tileMgr.imgErrorNumber;
	};

	/**
		獲得比例尺的換算單位,1px等於多少NTU

	*/
	PG.Map.prototype.getZoomUnits = function(zoom,xyDif)
	{
		var zu = [0,0];
		//因為18zoom是0.5971642833709717(this.minResolutionX)所以倒著算
		var a = Math.pow(2,(this._maxLevel-zoom));
		zu[0] = this.minResolutionX * a;			
		if(xyDif){
			zu[1] = this.minResolutionY * a;
			return zu;
		}else{
			return zu[0];
		}
	};

	/**
		獲取地圖墨卡托經緯度範圍
	*/
	PG.Map.prototype.GetViewport = function(){
		return this.getBoundsLatLng();
	};

	/**
		獲取地圖墨卡托經緯度範圍	
	*/
	PG.Map.prototype.getBoundsLatLng=function()
	{
		var centerPoint=this.centerPoint;
		var viewSize=this.viewSize;
		var zoomUnit=this.getZoomUnits(this.zoom,true);;

		var Xmin=parseInt(centerPoint.MercatorLng-zoomUnit[0]*viewSize[0]/2);
		var Ymin=parseInt(centerPoint.MercatorLat-zoomUnit[1]*viewSize[1]/2);
		var Xmax=parseInt(centerPoint.MercatorLng+zoomUnit[0]*viewSize[0]/2);
		var Ymax=parseInt(centerPoint.MercatorLat+zoomUnit[1]*viewSize[1]/2);

		var lnglatMin=PG.Tool.inverseMercator(Xmin,Ymin);
		var lnglatMax=PG.Tool.inverseMercator(Xmax,Ymax);

		//經緯度 乘
		Xmin=parseInt(lnglatMin[0]*100000);
		Ymin=parseInt(lnglatMin[1]*100000);
		Xmax=parseInt(lnglatMax[0]*100000);
		Ymax=parseInt(lnglatMax[1]*100000);

		//return new PG.Rect(Xmin,Ymax,Xmax,Ymin,false);
		
		//這種寫法可以跳過範圍檢測
		var rect = new PG.Rect(0,0,0,0,false);
		rect.SetLTRB([Xmin,Ymax,Xmax,Ymin]);
		return rect;
		
		
	};

	/**
		獲取地圖不需重新繪製的區域
	*/
	PG.Map.prototype.getDrawBounds=function()
	{
		var zu = this.getZoomUnits(this.zoom,true);
		var span=[this.maxPixel*zu[0],this.maxPixel*zu[1]];
		var areaCenter=this.areaCenter;

		var lnglatMin=PG.Tool.inverseMercator(areaCenter.MercatorLng-span[0],areaCenter.MercatorLat-span[1]);
		var lnglatMax=PG.Tool.inverseMercator(areaCenter.MercatorLng+span[0],areaCenter.MercatorLat+span[1]);
		return new PG.Rect(lnglatMin[0]*100000,lnglatMax[1]*100000,lnglatMax[0]*100000,lnglatMin[1]*100000);
				
	};

	/**
		添加控件---將控件的層添加到地圖
	*/
	PG.Map.prototype.AddControl=function(control)
	{
		if(control.initialize(this)==false){return false;}//控件的初始化操作
		var obj=control.getObject();
		if(obj)
		{
			this.container.appendChild(obj);
			if(obj.style.zIndex==0){PG.Tool.setZIndex(obj,1100);}
		}		
		this.controls.push(control);
		PG.Event.trigger(this,"addcontrol",[control]);
	};

	/**
		刪除控件---將控件的層刪除
	*/
	PG.Map.prototype.RemoveControl=function(control,depose)
	{		
		if(!control){return;}
		if(control.remove){control.remove();}
		var obj=control.getObject();
		if(obj && obj.parentNode){obj.parentNode.removeChild(obj);}		
		PG.Tool.deleteFromArray(this.controls,control);//從控件數組之中刪除控件
		if(depose && control.depose){control.depose();}
	};

	/**
		清除所有操作地圖控制項,即地圖上不使用操作控制項
	*/
	PG.Map.prototype.ClearControl=function()
	{		
		var control;
		for(var i=0;i<this.controls.length;i++){
			control=this.controls[i];
			if(control.remove){control.remove();}
			var obj=control.getObject();
			if(obj && obj.parentNode){obj.parentNode.removeChild(obj);}		
		}
		this.controls=[];
	};

	/**
		添加疊加物
	*/
	PG.Map.prototype.AddEntity=function(overlay,keep)
	{		
		if(!this.loaded){this.p_overlays.push(overlay);return;}//若地圖沒有加載則存入p_overlays
		if(overlay.initialize(this)==false){return false;}//疊加物的初始化操作
		var obj=overlay.GetObject();
		if(obj)
		{
			this.overlaysDiv.appendChild(obj);
			if(obj.style.zIndex==0){PG.Tool.setZIndex(obj,500);}
		}
		overlay.reDraw(true);
		PG.Event.trigger(overlay,"add",[this]);
		overlay._keep=keep;
		this.overlays.push(overlay);
	};

	/**
		刪除疊加層
	*/
	PG.Map.prototype.RemoveEntity=function(overlay,depose)
	{
		if(!overlay){return;}
		if(overlay.remove){overlay.remove();}
		var obj=overlay.GetObject();
		if(obj && obj.parentNode){obj.parentNode.removeChild(obj);}
		PG.Event.trigger(overlay,"remove",[]);
		if(depose && overlay.depose){overlay.depose();}		
		PG.Tool.deleteFromArray(this.overlays,overlay);//從疊加物數組之中刪除疊加物
	};

	/**
		清除疊加層

		depose	:  是否銷毀
		type	:  清除的疊加層類型,如果沒有定義
	*/
	PG.Map.prototype.ClearEntities=function(depose,type)
	{
		var t_f1=false;
		var t_f2=false;
		if(!type){
			t_f1=true;
		}else{
			var t=parseInt(type);			
			if(isNaN(t)){t_f1=true;}else{t_f2=true;}
		}		

		for(var i=this.overlays.length-1;i>=0;i--)
		{			
			if(!this.overlays[i] || !this.overlays[i]._keep)
			{
				if(t_f1||(t_f2&&(this.overlays[i].type==t))){
					this.RemoveEntity(this.overlays[i],depose);
				}
			}
		}
		if(this.p_overlays.length>0){
			var tmp;
			while(tmp = this.p_overlays.shift()){	
				if(t_f1||(t_f2&&(tmp.type==t))){
					this.RemoveEntity(tmp,depose);
				}
			}
		}
		if(this._MarkerInfoWin&&(!this._MarkerInfoWin.div)){this._MarkerInfoWin=null;}		
	};

	/**
		添加圖層(PG.TileLayer對像)
		一般是用來添加混合地圖類型的(參考PG.Map.prototype.focusType)
	*/
	PG.Map.prototype.AddLayer=function(layer,keep,insertFirst,isRedraw){
		if(layer.initialize(this)==false){return false;}//圖層的初始化操作
		var obj=layer.GetObject();
		insertFirst = insertFirst || false;
		if(obj)
		{
			if(insertFirst){
				//container.insertBefore(newFreeformLabel, container.firstChild);
				this.mapsDiv.insertBefore(obj, this.mapsDiv.firstChild);
			}else{
				this.mapsDiv.appendChild(obj);
			}
			//this.overlaysDiv  為500,不能蓋住this.overlaysDiv
			if(obj.style.zIndex==0){PG.Tool.setZIndex(obj,100);}
		}
		//拿圖重畫
		isRedraw = isRedraw || true;
		if(isRedraw){
			layer.reDraw(true);
		}
		//在添加圖層時觸發
		PG.Event.trigger(layer,"add",[this]);
		layer._keep=keep;
		this.layersAry.push(layer);
	};

	/**
		刪除圖層
	*/
	PG.Map.prototype.RemoveLayer=function(layer,dispose){
		if(!layer){return;}
		if(layer.remove){layer.remove();}
		var obj=layer.GetObject();
		if(obj && obj.parentNode)
		{
			obj.parentNode.removeChild(obj);
		}
		//觸發移除事件
		PG.Event.trigger(layer,"remove",[]);
		if(dispose && layer.dispose){layer.Dispose();}		
		PG.Tool.deleteFromArray(this.layersAry,layer);
	};

	/**
		清除圖層
	*/
	PG.Map.prototype.ClearLayers=function(dispose){
		for(var i=this.layersAry.length-1;i>=0;i--)
		{
			if(!this.layersAry[i] || !this.layersAry[i]._keep)
			{
				if(!this.layersAry[i].getKeep()){
					this.RemoveLayer(this.layersAry[i],dispose);
				}
			}
		}
	};

	/**
		得到添加的所有圖層
	*/
	PG.Map.prototype.GetLayers = function(){
		return this.layersAry.concat();
	};

	/**
		將地圖上相對於container的像素坐標轉化為地理坐標
		參數是PG.Geo對像
		返回值是PG.Geo
	*/
	PG.Map.prototype.WindowToWorld = function(geo){
		var g = geo;
		switch(geo.type){
			case window.PG.GEO_POINT :
				g = this.fromContainerPixelToLatLng([geo.x,geo.y]);
				break;
			case window.PG.GEO_RECT :
				var min = this.fromContainerPixelToLatLng([geo.left,geo.bottom]);
				var max = this.fromContainerPixelToLatLng([geo.right,geo.top]);
				g = new PG.Rect(min.x,max.y,max.x,min.y,false);				
				break;
			case window.PG.GEO_POLYLINE :
			case window.PG.GEO_POLYGON :
				var ps = this.handleTransPoints(geo.points,true);
				g = geo.type==window.PG.GEO_POLYLINE?new PG.Polyline(ps):new PG.Polygon(ps);
				break;
			case window.PG.GEO_POLYGONSET :
				g = new PG.PolygonSet(this.handlePolygonSetBounds(this.bounds,true),this.handlePolygonSetBounds(this.holes,true));
				break;
			default :break;
		}
		return g;
	};	

	/**
		將地圖上相對於container的像素坐標轉化為地理坐標
		參數point是數組[left,top]
		返回值是PG.Point

		此方法和fromLatLngToContainerPixel互為逆運算
	*/
	PG.Map.prototype.fromContainerPixelToLatLng=function(point,center)
	{
		var zoomUnit=this.getZoomUnits(this.zoom,true);
		center=center?center:this.centerPoint;
		return this.MercatorToLngLat(center.MercatorLng+zoomUnit[0]*(point[0]-this.viewSize[0]/2),center.MercatorLat-zoomUnit[1]*(point[1]-this.viewSize[1]/2),false);
	};

	/**
		將地理坐標轉化為地圖上點的像素坐標(相對於container)
		參數是PG.Geo
		返回值是PG.Geo
	*/
	PG.Map.prototype.WorldToWindow = function(geo){
		var g = geo;
		switch(geo.type){
			case window.PG.GEO_POINT :
				g = this.fromLatLngToContainerPixel(geo);
				break;
			case window.PG.GEO_RECT :
				var min = this.fromLatLngToContainerPixel(new PG.Point(geo.left,geo.bottom,false));
				var max = this.fromLatLngToContainerPixel(new PG.Point(geo.right,geo.top,false));
				g = new PG.Rect(min.x,max.y,max.x,min.y);				
				break;
			case window.PG.GEO_POLYLINE :
			case window.PG.GEO_POLYGON :
				var ps = this.handleTransPoints(geo.points,false);
				g = geo.type==window.PG.GEO_POLYLINE?new PG.Polyline(ps):new PG.Polygon(ps);
				break;
			case window.PG.GEO_POLYGONSET :
				g = new PG.PolygonSet(this.handlePolygonSetBounds(this.bounds,false),this.handlePolygonSetBounds(this.holes,false));
				break;
			default :break;
		}
		return g;
	};

	/**
		將地理坐標轉化為地圖上點的像素坐標(相對於container)
		參數point是PG.Point
		返回值是數組[left,top]
	*/
	PG.Map.prototype.fromLatLngToContainerPixel=function(point,center)
	{
		var zoomUnit=this.getZoomUnits(this.zoom,true);
		center=center?center:this.centerPoint;
		var p = [Math.round((point.MercatorLng-center.MercatorLng)/zoomUnit[0]+this.viewSize[0]/2),Math.round((center.MercatorLat-point.MercatorLat)/zoomUnit[1]+this.viewSize[1]/2)];
		return new PG.Point(p[0],p[1]);
	};

	/**
		處理PolygonSet:
		b		:PG.Polygon[]
		flag	:true(像素坐標轉化為地理坐標),false(地理坐標轉化為像素坐標)
	*/
	PG.Map.prototype.handlePolygonSetBounds=function(b,flag)
	{
		if(!b){return null;}
		var bounds = [];
		var len1 = b.length;
		for(var i=0;i<len1;i++){
			bounds.push(new PG.Polygon(this.handleTransPoints(b[i].points,flag)));
		}
		return bounds;
	};

	/**
		處理PG.Point:
		p		:PG.Point[]
		flag	:true(像素坐標轉化為地理坐標),false(地理坐標轉化為像素坐標)
	*/
	PG.Map.prototype.handleTransPoints=function(p,flag)
	{
		if(!p){return null;}
		var ps = [];
		var len = p.length;
		for(var i=0;i<len;i++){
			ps.push(this.handleTransCPLL(p[i],flag));
		}
		return ps;
	};

	/**
		處理PG.Point:
		p		:PG.Point
		flag	:true(像素坐標轉化為地理坐標),false(地理坐標轉化為像素坐標)
	*/
	PG.Map.prototype.handleTransCPLL=function(p,flag)
	{
		return flag?this.fromContainerPixelToLatLng([p.x,p.y]):this.fromLatLngToContainerPixel(p);
	};

	/**
		類似於WorldToWindow方法
		將地理坐標轉化為地圖上點的像素坐標(此坐標相對於放置標注的層)
		自定義標注的時候會用到此方法,返回值是數組PG.Point對象。
	*/
	PG.Map.prototype.GetRelativeXY=function(lnglat)
	{
		var p=this.fromLatLngToContainerPixel(lnglat);
		var flag=p[0]>this.maxPixel*(-0.5) && p[1]>this.maxPixel*(-0.5) && p[0]<this.maxPixel*(1.5) && p[1]<this.maxPixel*(1.5);
		var c = [p[0]-parseInt(this.mapsDiv.style.left),p[1]-parseInt(this.mapsDiv.style.top),flag];
		var rp = new PG.Point(c[0],c[1]);
		rp[2] = c[2];
		return rp;
	};

	/**
		將地圖上點的像素坐標(此坐標相對於放置標注的層)轉化為地理坐標,
		自定義標注的時候會用到此方法
		返回值是PG.Point對像.
	*/
	PG.Map.prototype.GetRelativeLngLat = function(point){
		var x = point.x + parseInt(this.mapsDiv.style.left);
		var y = point.y + parseInt(this.mapsDiv.style.top);
		return this.fromContainerPixelToLatLng(new PG.Point(x,y));
	};

	/**
		返回最大的X軸坐標範圍
	*/
	PG.Map.prototype.getMaxRect = function(){
		var zu = this.getZoomUnits(this.zoom,true);
		var minx = 0;
		var maxx = parseInt(this.maxResolution*128*2 / (zu[0]*this.imgSize));
		return [minx,maxx];
	};

	/**
		定位地圖

		point：經緯度
		zoom：指定的比例尺
		type：指定的地圖類型
	*/
	PG.Map.prototype.SetCenter = function(point,zoom,type){	
		if(!this.ISInRange(point)){return;}
		if(!this.loaded){	
			if(!zoom){
				zoom=8;
			}
			this.centerAndZoom(point,zoom);			
		}else{
			this.ZoomPan(point,zoom);
		}
		if(type){
			this.SetMapType(type);
		}
	};

	/**
		設置地圖的中心點坐標和縮放倍數
	*/
	PG.Map.prototype.centerAndZoom=function(point,zoom)
	{
		if(typeof(zoom)=="string" && zoom!="")
		{
			zoom=parseInt(zoom);
		}
		//使zoom合法化
		zoom = this.toLegal(zoom);
		//判斷zoom是否在指定範圍之中
		var index=this.getZoomIndex(zoom);
		if(index<0){return;}
		var lastMapDiv=this["mapsDiv_"+this.zoomIndex];	//當前的等級層
		this.zoomIndex=index;
		this.lastCenterPoint=point;
		this.lastZoom=this.zoomLevels[this.zoomIndex];
		this.zoomUnits=this.getZoomUnits(this.lastZoom,true);
		var flag;
		if(!this.loaded)
		{//未加載,執行初始化
			this.initialize();
			var flag=true;
		}
		if(this.lastZoom==this.zoom && !flag)
		{
			this.setCenterAtLatLng(point);
			PG.Event.trigger(this,"OnMoveEnd",[this.centerPoint]);
		}
		else
		{
			this.centerPoint=point;
			this.zoom=this.lastZoom;
			//如果該比例尺下的mapsDiv不存在則新建一個
			//也就是說有18個地圖級別,也就有18個地圖層,這就是地圖滑動的時候產生層次效果的原因??---徐金評
			if(!this["mapsDiv_"+this.zoomIndex])
			{
				this["mapsDiv_"+this.zoomIndex]=PG.Tool.createDiv(1,null,100);
				this.mapLayerDiv.appendChild(this["mapsDiv_"+this.zoomIndex]);
			}
			this.setTopMapDiv(this.zoomIndex);
			this["mapsDiv_"+this.zoomIndex].style.zoom=1;//設置對象的縮放比例,其實默認就是1
			//加載顯示圖片
			this.moveMapImages(true);
			//zoom,slidezoom在PG.MapControl.initialize註冊,沒註冊不做任何操作
			PG.Event.trigger(this,"OnZoom",[0,this.zoom]);
			PG.Event.trigger(this,"slidezoom",[this.zoomIndex]);
			//加載overlay
			if(this.p_overlays.length>0)
			{
				var overlay;
				while(overlay=this.p_overlays.shift())
				{
					this.AddEntity(overlay);
				}
			}
		}
	};
	
	/**
		設置合法的縮放級別(防止用戶傳入的級別超出範圍)
	*/
	PG.Map.prototype.toLegal = function(z){
		var z = parseInt(z);
		if(z<this.zoomLevels[0]){
			z=this.zoomLevels[0];
		}else if(z>this.zoomLevels[this.zoomLevels.length-1]){
			z=this.zoomLevels[this.zoomLevels.length-1];
		}
		return z;
	};
	
	/**
		得到合法的X坐標
	*/
	PG.Map.prototype.toSpanXLegal = function(bx){
		var rect = this.getMaxRect();
		if(bx<=rect[0]){
			bx = rect[1] + bx%rect[1];
		}
		if(bx>=rect[1]){
			bx = bx%rect[1];
		}
		return bx;
	};
	
	/**
		保存地圖的當前狀態
	*/
	PG.Map.prototype.SaveViewport = function(){
		this.lastCenterPoint = this.GetCenter().Clone();
		this.lastZoom = this.GetZoomLevel();
	};

	/**
		恢復地圖到上一次保存的狀態
	*/
	PG.Map.prototype.RestoreViewport = function(){
		this.returnLastView();
	};

	/**
		返回上一視圖(上一比例尺和中心點)的函數
	*/
	PG.Map.prototype.returnLastView=function()
	{
		if(typeof(this.lastZoom)=="number" && this.lastCenterPoint)
		{
			this.ZoomPan(this.lastCenterPoint,this.lastZoom);
		}
	};

	/**
		獲得單元格的數目,應該是圖像數,但是我發現有時候這個數目大於圖像數,所以這個數字不能作為總圖像數
		這個函數目前沒有被人調用
	*/
	PG.Map.prototype.getMapTableNum = function()
	{
		var cellsNum = Math.ceil(this.viewSize[0]/this.imgSize);
		var rowsNum = Math.ceil(this.viewSize[1]/this.imgSize);
		rowsNum += 1;
		cellsNum += 1;
		return [ cellsNum , rowsNum ];
	};

	/**
		地圖初始化,生成地圖圖片
	*/
	PG.Map.prototype.initialize=function()
	{
		PG.Event.trigger(this,"OnInit");
		this.loaded=true;
	};

	/**
		靜態方法-轉換物理坐標為塊數坐標,數組後面兩個元素應該是點在小圖片中像素坐標	

	*/
	PG.Map.prototype.toMapId = function(point,zoom)
	{
		//x,y原點在 左上
		var x=point.MercatorLng-this._baseX;//xx-(-15...) =>下-15~15...上
		var y=this._baseY-point.MercatorLat;//15...-yy =>下-15~15...上
		//依級數zoom取得每一象素點代表的距離(公尺)
		var zu = this.getZoomUnits(zoom,true);
		var spanX = zu[0]*this.imgSize;//zu[0]為1px代表的緯度,this.imgSize為加載的圖片大小(256)
		var spanY = zu[1]*this.imgSize;//zu[1]為1px代表的經度,this.imgSize為加載的圖片大小(256)
		//算出圖塊序數
		var bx=parseInt(x/spanX);
	    var by=parseInt(y/spanY);
	    //[圖塊x, 圖塊y, 餘X像數, 餘Y像數]
	    return [bx,by,(x-bx*spanX)/spanX*this.imgSize,(y-by*spanY)/spanY*this.imgSize];
	};

	/**
		移動或加載map地圖圖片的入口方法
		flag為true代表初始化或改變縮放等級,將當前中心點變為區域中心點
		
		地圖改變事件大致分為五類:
		1,中心點改變;2,zoom改變事件;3,中心點和zoom改變事件;4,拖動地圖;5,滑鼠滾動
		這五類事件改變地圖的核心方法都為moveMapImages

		這個函數刪除了很多代碼,如果有什麼問題,請參考以前的版本-----徐金評

	*/
	PG.Map.prototype.moveMapImages=function(flag)
	{		
		var zoom=this.zoom;
		var zoomUnits=this.getZoomUnits(this.zoom,true);//地圖比例尺的換算單位(1px等於多少NTU)
		var centerPoint=this.centerPoint;
		var areaCenter=this.areaCenter;
		var centerBox= this.toMapId(centerPoint,zoom);//轉換物理坐標為塊數坐標
		//如果當前中心點離區域中心點太遠,則將當前中心點變為區域中心點
		if(!flag && areaCenter && (Math.abs(areaCenter.MercatorLng-centerPoint.MercatorLng)/zoomUnits[0]+this.viewSize[0]/2>this.maxPixel || Math.abs(areaCenter.MercatorLat-centerPoint.MercatorLat)/zoomUnits[1]+this.viewSize[1]/2>this.maxPixel)){
			flag=true;
		}
		if(flag){this.areaCenter=this.MercatorToLngLat(centerPoint.MercatorLng,centerPoint.MercatorLat,false);}

		//計算需要加載的地圖的範圍[(minX,minY)  (maxX,maxY)]
		var imgSize=this.imgSize;
		var minX=centerBox[0]-Math.ceil((this.viewSize[0]/2-centerBox[2])/imgSize);
		var minY=centerBox[1]-Math.ceil((this.viewSize[1]/2-centerBox[3])/imgSize);
		var maxX=centerBox[0]+Math.ceil((this.viewSize[0]/2+centerBox[2])/imgSize)-1;
		var maxY=centerBox[1]+Math.ceil((this.viewSize[1]/2+centerBox[3])/imgSize)-1;

		
		
		//清空上次的未顯示出來的,ZoomPan縮放時有可能上次的元素需要隱藏(ff下縮放用到)
		this.tileMgr.slideImgs = [];
		
		//offset用於計算新圖片的位置,請參考PG.MapTileMgr.showTile方法
		//算法似乎和toMapId方法相反----徐金評 
		//此處優化過
		//var offset=[(-this.areaCenter.MercatorLng+this._baseX)/zoomUnits[0],(this.areaCenter.MercatorLat+this._baseX)/zoomUnits[1]];
		var offset=[0,0];	
		offset[0] = (-this.areaCenter.MercatorLng+this._baseX)/zoomUnits[0];
		offset[1] = (this.areaCenter.MercatorLat-this._baseY)/zoomUnits[1];
			

		//從for-each之中取得的項目,為避免用戶網頁上對array進行了prototype修改,必須進行判斷
		//判斷已經加載的圖片是否在顯示的圖片裡面,若在則顯示,否則隱藏
		var mapImages=this.tileMgr.mapImages;
		for(var imageName in mapImages)
		{			
			var tile=mapImages[imageName];
			var id=tile.id;
			if(!id){continue;}
			if(id[2]==this.zoomIndex && (minX>id[0] || maxX<id[0] || minY>id[1] || maxY<id[1]))
			{
				this.hideMapImage(tile);
			}
			else if(id[2]!=this.zoomIndex && (this.zoomLevels[id[2]]!=this.oZoom || !tile.loaded))
			{
				this.hideMapImage(tile);
			}
			else if(this.zoomLevels[id[2]]&&this.zoomLevels[id[2]]==this.oZoom)
			{
				//假設縮小,從15到14,zoomUnits的大小為14的,要定位15的圖
				//要用15的zoomUnits,所以要乘以2的一次方,
				//id裡的塊數用的14的zoomUntis,所以offset也要用14的zoomUntis,
				//所以要乘以2的1次方(相當於offset[0]*Math.pow(2,this.oZoom-zoom))
				this.showMapImage(id,[offset[0]*Math.pow(2,this.oZoom-zoom),offset[1]*Math.pow(2,this.oZoom-zoom)],flag);
				PG.Event.trigger(this,"OnHiddenImg",[id]);
			}
		}

		//添加或重新設置所有圖片---此處優化過---徐金評
		this.imgTotalNumber = 0;//已經加載的圖片數量
		var count=(maxX-minX+1)*(maxY-minY+1);//需要加載的圖片總數量
		
		for(var x=minX;x<=maxX;x++)
		{
			for(var y=minY;y<=maxY;y++)
			{
				this.imgTotalNumber++;
				this.showMapImage([x,y,this.zoomIndex],offset,flag,(this.imgTotalNumber===count));
			}
		}

		this.toCenter(flag);
		PG.Event.trigger(this,"movemapimages",[this.centerPoint]);
		return;
	};

	/**
		將地圖的centerPoint移動到地圖圖層中心
	*/
	PG.Map.prototype.toCenter=function(flag)
	{	
		var centerPoint=this.centerPoint;
		var zoomUnits=this.getZoomUnits(this.zoom,true);
		var divZoom=this.divZoom?this.divZoom:1;
		var position=[this.viewSize[0]/2-(centerPoint.MercatorLng-this.areaCenter.MercatorLng)/zoomUnits[0]*divZoom,this.viewSize[1]/2+(centerPoint.MercatorLat-this.areaCenter.MercatorLat)/zoomUnits[1]*divZoom];
		PG.Tool.setPosition(this.mapsDiv,position);
		PG.Tool.setPosition(this.maskDiv,[-position[0],-position[1]]);
		//顏色層,感覺沒啥用,以後也許會刪去
		if(this.maskColorDiv){
			PG.Tool.setPosition(this.maskColorDiv,[-position[0],-position[1]]);
		}
		
		if(flag==true)
		{
			var overlays=this.overlays;
			var overlaysLen=overlays.length;
			for(var i=0;i<overlaysLen;i++)
			{
				overlays[i].reDraw(flag);
			}
			PG.Event.trigger(this,"redraw",[]);
		}
		PG.Event.trigger(this,"OnMove",[this.centerPoint,flag==true]);
	};
	
	/**
		加載map地圖圖片的主方法
		id為數組,格式為[x,y,zoomIndex]
	*/
	PG.Map.prototype.showMapImage=function(id,offset,flag,isEnd)
	{				
		if(this.ISInRange(id)){
			this.tileMgr.showTile(id,offset,flag,isEnd);
			//縮放結束時再加載圖片,提高性能	
			if(!this.slideObject){	//此代碼主要加載混合地圖
				PG.Event.trigger(this,"OnShowImg",[id,offset,flag,isEnd]);
			}
		}			 
	};

	/**
		判斷經緯度是否在設定的範圍之內
	*/
	PG.Map.prototype.ISInRange = function (id){
		if(this.hasSetRange){return this.ZoomAllRange.ContainsPoint(this.XYToLngLat(id[0],id[1],this.zoomLevels[id[2]]));}else{return true;}
		
	}

	/**
		塊號轉經緯度
	*/
	PG.Map.prototype.XYToLngLat = function (bx,by,zoom){
			var map = this;
			var zu = map.getZoomUnits(zoom,true);
			var spanX = zu[0]*map.imgSize;//zu[0]為1px代表的緯度,this.imgSize為加載的圖片大小(256)
			var spanY = zu[1]*map.imgSize;//zu[1]為1px代表的經度,this.imgSize為加載的圖片大小(256)
			var x = bx*spanX,y = by*spanY;
			var lng = x + map._baseX;
			var lat = map._baseY-y;
			
			var lnglatMin=PG.Tool.inverseMercator(lng,lat);
			var XNTU=parseInt(lnglatMin[0]*100000);
			var YNTU=parseInt(lnglatMin[1]*100000);
			return new PG.Point(XNTU,YNTU,false);
		};

	/**
		隱藏map地圖圖片
	*/
	PG.Map.prototype.hideMapImage=function(tile)
	{
		this.tileMgr.hideTile(tile);
		PG.Event.trigger(this,"OnHiddenImg",[tile.id]);
	};

	/**
		重設地圖圖片---在地圖類型改變的時候調用
	*/
	PG.Map.prototype.Refresh = function(){
		var imageName = null;	
		for(var i=0;i<this.tileMgr.bufferImages.length;i++){
			imageName = this.tileMgr.bufferImages[i];
			if(this.tileMgr.mapImages[imageName]){
				continue;
			}
			this.hideMapImage(this.tileMgr.bufferImages[imageName]);
			delete  this.tileMgr.bufferImages[imageName];
		}
		this.tileMgr.bufferImages=[];
		//從for-each之中取得的項目,為避免用戶網頁上對array進行了prototype修改,必須進行判斷
		for(var imageName in this.tileMgr.mapImages)
		{
			var tile=this.tileMgr.mapImages[imageName];
			if(!tile.id){continue;}
			this.hideMapImage(tile);
		}
		this.moveMapImages(true);    
	};

	/**
		獲取一個PG.InfoWindow,注意這個PG.InfoWindow是整個地圖唯一的,被PG.Marker共享
	*/
	PG.Map.prototype.GetWindowEntity = function(){
		if(!this._MarkerInfoWin)	
		{
			this._MarkerInfoWin = new PG.WindowEntity();
		}
		return this._MarkerInfoWin;
	};

	/**
		設置地圖的取圖函數。
		例如：function(x,y,z){return some_url+x+y+z;},x,y,z為地圖的塊號
		返回值為圖片的路徑
	*/
	PG.Map.prototype.SetGetTileUrl = function(handle){
		this.getMapImagesUrl = handle;
	};

	/**
		得到放maplayer圖層的DIV對象的zIndex
	*/
	PG.Map.prototype.setZIndex = function(idx){
		this.mapLayerDiv.style.zIndex = idx;
	};

	/**
		得到放地圖標注的DIV對象的zIndex
	*/
	PG.Map.prototype.setOverLayZIndex = function(idx){
		this.overlaysDiv.style.zIndex = idx;
	};
    /**
		thomas 對外開api
		加載map地圖layer圖片的方法
		可以動態指定獲取圖片的網址url,以及ext
		使用pilotgaea(PG)特別的網址加密法

	*/
	PG.Map.prototype.GetPGMapImgUrl=function(url,ext)
	{	
		if(!ext){ext=".png";}
		var ltmap=this;	
		return function(bx,by,z){
			var e = ltmap.handleLL(by,7);
			var f = ltmap.custEncode(z+'\0'+by+'\0'+bx,bx);
			return url + 'level' + (z>9?z:"0"+z) + '/row' + e + '/' + f + ext;//".png";
		};
	};
	/**
		加載map地圖圖片的底層方法
		獲取圖片的網址
		此為獲取Pilotgaea預設地圖的方法

	*/
	PG.Map.prototype.getMapImagesUrl=function(bx,by,z)
	{		
		var e = this.handleLL(by,7);
		var f = this.custEncode(z+'\0'+by+'\0'+bx,bx);
		return this.imgURLs[0] + 'level' + (z>9?z:"0"+z) + '/row' + e + '/' + f + ".png";
	};
	/**
		數a轉成字串,並在前面補0,直到長度為b
	*/
	PG.Map.prototype.handleLL=function(a,n){
		var txt = a.toString();
		var l = n - txt.length;
		var c = [];
		for(var i=0;i<l;i++){c.push('0');}
		return c.join('') + txt;

	};
	/*
	 * url 位址加密演算
	 */
	PG.Map.prototype.custEncode = function(rawstr,x)
	{
		   var chTable=["q_a7z4w1sx","e852dcrf-v","rfv+t963gb","u0=jmikolp"];
		   var str=this.toHex(rawstr);
		   var i;
		   var uct = chTable[x%4];      
		   var encStr = ""; 
		   for (i=0; i<str.length; i++){        
			  encStr += uct.charAt(parseInt(str.charAt(i),10));
		   }
		   return encStr;
	}
	
	PG.Map.prototype.splitToArray = function(str)
	{
	    var i;
	   var cba = [];  // character code byte array
	   var ch;        // single character
	   var reg = RegExp("%","g");
	   for (i=0; i<str.length; i++) {
		 ch = str.charCodeAt(i);
		 if (ch > 0x007f) {
			ch = parseInt(encodeURI(str.charAt(i)).replace(reg,''),16);
			if (ch > 0x07ff) cba.push((ch >>> 16) & 0xff);
			cba.push((ch >>> 8) & 0xff);
		 }
		 cba.push(ch & 0xff); 
	   }
	   return cba;
	};
	/*
	 * 轉16位元表示
	 */
	PG.Map.prototype.toHex = function(str) {
			var hex = '';
			var a;
			for(var i=0;i<str.length;i++) {
				a=str.charCodeAt(i).toString(16);
				if(a.length<2)a="0"+a;
				hex += ''+a;
			}
			return hex;
	};
/*jsonp*/
PG.Map.prototype.getScript=function(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    // 跨瀏覽器處理 script 下載完成後的事件
    script.onload = script.onreadystatechange = function() {
        if (!this.readyState ||
            this.readyState === "loaded" || 
            this.readyState === "complete") {
            this.onload = this.onreadystatechange = null;
            document.getElementsByTagName('head')[0]
                    .removeChild(this);
            //通常為清理暫時物件
            callback();
        }
    };
    
    document.getElementsByTagName('head')[0]
            .appendChild(script);
}
PG.Map.prototype.sleep=function(ms) {
	var dt=new Date();
	dt.setTime(dt.getTime()+ms);
	while(new Date().getTime()<dt.getTime());
}
//暫時的函式名稱
//jsonp.jsc = new Date().getTime();
/**
	thomas 對外開api
	加載map地圖layer圖片的方法
	可以動態指定獲取圖片的網址url,以及ext
	使用pilotgaea(PG)特別的網址加密法

*/
PG.Map.prototype.getPGMapImgFunc=function(url,version)
{	
	return function(bx,by,z)
	{	
		return url + PG.Map.g_Encode(bx,by,z,version);//'.png';	
	}	
};
/**
	設定Pilotgaea Tilemap Server地圖圖片的底層方法function
	url,=>獲取圖片的網址
	layer,=>作用的圖層
	callbackfunc,=>回呼
	isNormal=>是否作為PG.NORMAL_MAP來用  default為false
*/
window._PGTM_={};
PG.Map.prototype.SetMapImagesFunc=function(url,layer,callbackfunc,isNormal)
{
	//this.imgURLs[0]='TM.DLL?LN=Asia
	//var version=this.g_GetVersion(this.imgURLs[0]+'&C=VER');	
	var g = new Date().getTime();
	g='XD'+g;
			window._PGTM_[g]={};
			window._PGTM_[g]._c=this.g_SetGetTileUrl;
			window._PGTM_[g]._layer=layer;
			window._PGTM_[g]._thismap=this;//PG.Map instance
			window._PGTM_[g]._callbackfunc=callbackfunc;
			window._PGTM_[g]._isNormal=isNormal;
			layer.Version="0";
			//window._PGTM_[g].HR=function(data){if(this._c){this._c(data,url,this._layer,this._thismap,this._callbackfunc,this._isNormal);}};
			window._PGTM_[g].HR=function(data){if(window._PGTM_[g]._c){window._PGTM_[g]._c(data,url,window._PGTM_[g]._layer,window._PGTM_[g]._thismap,window._PGTM_[g]._callbackfunc,window._PGTM_[g]._isNormal);}};
			var clearFunc=function() {
	                         // script 下載並執行完後移除暫時的函式
	                         window[g] = undefined;
	                         try {
	                             delete window._PGTM_[g];
	                         }
	                         catch(e) {}
	                    }
			//var html = [];
			//html.push(url);
			//html.push("&C=VER&callback=");
			//html.push(encodeURIComponent("_PGTM_."+g+".HR"));
			//var cb=encodeURIComponent("window._PGTM_."+g+".HR");
		if(!window.PG.isNull(window.PG["VERSION_SERVER"]) && window.PG.VERSION_SERVER !="" ){
			 //var url4ajax= location.protocol + "//" + location.hostname +(location.port && ":" + location.port)+ "/GetVer.php"+
			 var url4map_ajax=window.PG.VERSION_SERVER+((window.PG.VERSION_SERVER.indexOf('?')<0)?
			 '?url4map=':'?url4map=')+encodeURIComponent(url+'&C=VER&callback=PG.Map.returnData')//
			 //url.substr(url.indexOf('?'))+
		     // "&C=VER&callback=PG.Map.returnData";
	            this.getAJAX(url4map_ajax,null,true,window._PGTM_[g].HR, false, clearFunc);
		}else{
			 //IE會有問題
			this.getScript(url+"&C=VER&callback="+encodeURIComponent("_PGTM_."+g+".HR"), clearFunc);
		}    
	//PG.WebService.prototype.loadJSONPData(this.imgURLs[0]+'&C=VER&callback=PG.Map.prototype.g_SetGetTileUrl');
	//return function(bx,by,z){this.imgURLs[0]+'&C=MAP&ID=' + this.g_Encode(bx,by,z,version);};//'.png';	
};
/**
		創建Ajax核心對像XMLHttpRequest
	*/
	PG.Map.createHttpRequest=function()
	{
		if(window.XMLHttpRequest)
		{
			return new XMLHttpRequest();
		}
		else if(typeof(ActiveXObject)!="undefined")
		{
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
	};
	PG.Map.returnData=function(data)
	{
		return data;
	};
/**
	加載數據(AJAX)
*/
PG.Map.prototype.getAJAX=function(url,params,isC,c,async,callback)
{
	var th = this;
	var request=PG.Map.createHttpRequest();
	//async非同步request.open("post",url,true);, sync同步request.open("post",url,false);
	if((typeof async == 'undefined'))async=true;//預設非同步
	request.open("GET",url,async);
	//post
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
	request.setRequestHeader("X-Requested-With","XMLHttpRequest"); 
	//在非同步模式下，最佳實作方式不是去while「檢查 readyState 的狀態」，而是去「等待 readyState 的改變事件」 
	request.onreadystatechange=function()
	{
		//if(request.readyState!=4){return;}
		if (request.readyState == 4){
			if(request.status == 200){
				//alert(request.responseText);
				//eval(request.responseText);
				//console.log('version值是：%s','d.version');
				var d = eval(request.responseText);
				//alert(d.version);
				//console.log('version值是：%s',d.version);
				//console.log('c值是：%s',c);
				if(isC){c(d);}else{window[c] = d;}
				if(callback){callback();}
			}
        } 			
	};
	request.send(params);
};
PG.Map.g_EncodeTable = 
[
	["3","6","7","8","5","4","9","1","0","2"],
	["8","4","6","1","2","5","7","0","9","3"],
	["9","2","8","3","1","7","4","5","6","0"],
	["5","1","2","6","3","9","0","7","8","4"],
	["7","0","5","2","8","3","6","1","4","9"]
];

PG.Map.g_OffsetTable = [3, 7, 9];
//callback get the layer version
PG.Map.prototype.g_SetGetTileUrl = function(jsondata,url,layer,thismap,callbackfunc,isNormal)
{
	//var mp=this;
	//console.log('version值是：%d',jsondata.version);
	//console.log('thismap.getPGMapImgFunc值是：%s',typeof(thismap.getPGMapImgFunc));
	//console.log('layer.Version值是：%s',layer.Version);
	jsondata=jsondata||{};
	var version=jsondata.version||"0";
	var layername=jsondata.layer||"";
	var func=(PG.isNull(thismap.getPGMapImgFunc))?thismap.prototype.getPGMapImgFunc:thismap.getPGMapImgFunc;
	layer.SetGetTileUrl(
		func.call(thismap,url+'&C=MAP&ID=',version)//func(url+'&C=MAP&ID=',version)
	);
	//console.log('layer是：%s',layername);
	//for PG.NORMAL_MAP,將預設的取圖函數設為此
	if(isNormal){
		thismap.getMapImagesUrl=func.call(thismap,url+'&C=MAP&ID=',version);//func(url+'&C=MAP&ID=',version);
		//console.log('NL 是：%s',layername);
	}
    //console.log('layer.getTileUrl值是：%s',layer.getTileUrl);
	layer.Version=version;
	layer.LayerName=layername;
	//PG.WebService.prototype.loadJSONPData(url);
	if(callbackfunc)callbackfunc(thismap);
};
PG.Map.g_Encode = function(Col, Row, Zoom, Version)//(Version, Zoom, Row, Col)
{
    var r = Col % 5;
    var base = Row % 10;
    var oi = Zoom % 3;
    var offset = PG.Map.g_OffsetTable[oi];
    
    var content = PG.Map.prototype.handleLL(Version, 2) + PG.Map.prototype.handleLL(Zoom, 2) + PG.Map.prototype.handleLL(Col, 7) + PG.Map.prototype.handleLL(Row, 7);
    var code = "";
	for (var i = 0; i < 18; i++)
	{
	    code += PG.Map.g_EncodeTable[r][(base + i * offset + (content.charCodeAt(i) - 48)) % 10];
	}

    var count = r * 30 + base * 3 + oi;
    var key = String.fromCharCode(count / 26 + 65, count % 26 + 65);
    
	return key + code;
};

	/**
		返回二維地圖瓦片的加載地址

		比如截圖需要用到
	*/
	PG.Map.prototype.getImgUrl = function(){
		return this.imgURLs[0];
	};

	/**
		得到地圖圖片擴展名
	*/
	PG.Map.prototype.getExtName = function(){
		return ".png";
	};

	/**
		設置地圖的縮放級別
	*/
	PG.Map.prototype.SetZoom = function(z){
		this.zoomTo(z);
	};

	/**
		改變地圖的縮放級別,
	*/
	PG.Map.prototype.zoomTo=function(zoom)
	{	
		this.divZoom=1;		
		if(zoom==this.zoom)
		{
			this.zoomToByStyle();	//通過滑鼠滑輪改變縮放等級的時候
			PG.Event.trigger(this,"OnZoomEnd",[this.zoom]);
			return;
		}
		zoom = this.toLegal(zoom);//使zoom合法化		
		var index=this.getZoomIndex(zoom);
		if(index<0){return;}
		var oZoom=this.zoom;
		var oZIndex=this.zoomIndex;
		this.zoomIndex=index;
		this.zoom=this.zoomLevels[this.zoomIndex];
		this.zoomUnits=this.getZoomUnits(this.zoom,true);
		if(!this["mapsDiv_"+this.zoomIndex])
		{
			this["mapsDiv_"+this.zoomIndex]=PG.Tool.createDiv(1);
			this.mapLayerDiv.appendChild(this["mapsDiv_"+this.zoomIndex]);
		}
		if(this.isZoomSlide&&Math.abs(this.zoom-this.zoomLevels[oZIndex])<=this.slideMaxZoom)
		{//假如支持滑動縮放等級
			if(!this.slideObject)
			{//創建滑動對像
				this.slideObject={timeout:window.setInterval(PG.Event.getCallback(this,this.slide),this.slideIntervalTime)};
			}
			var slideObject=this.slideObject;
			if(typeof(this.slideObject.endZIndex)!="number")
			{
				PG.Tool.inherit(this.slideObject,{oZIndex:oZIndex,startZIndex:oZIndex});
				if(this.divZoom&&this.divZoom!=1)
				{
					slideObject.startZIndex=oZIndex+Math.log(this.divZoom)/Math.log(2);
				}
			}
			else
			{
				PG.Tool.inherit(this.slideObject,{oZIndex:slideObject.endZIndex,startZIndex:slideObject.zIndex});
			}
			//構造滑動縮放對像
			slideObject.endZIndex=index;
			slideObject.number=0;
			this.oZoom=this.zoomLevels[slideObject.oZIndex];
			//移動或加載地圖圖片
			this.moveMapImages(true);
			if(PG.Tool.isImgZoom()){
				
			}else{
				this["mapsDiv_"+slideObject.endZIndex].style.zoom=1;
				//縮小時為0.5,放大時為2,詳見zoomtobystyle裡的說明
				this["mapsDiv_"+slideObject.oZIndex].style.zoom=Math.pow(2,this.zoomLevels[slideObject.endZIndex]-this.zoomLevels[slideObject.oZIndex]);
			}
			this.setTopMapDiv(slideObject.oZIndex);		
			this.slide();
			PG.Event.trigger(this,"OnZoomStart",[this.oZoom,this.zoom]);
		}
		else
		{
			this.setTopMapDiv(oZIndex);
			this.mapsDiv.style.zoom=1;
			this["mapsDiv_"+this.zoomIndex].style.zoom=1;
			PG.Event.trigger(this,"slidezoom",[this.zoomIndex]);
			//移動或加載地圖圖片
			this.moveMapImages(true);
		}			
		PG.Event.trigger(this,"OnZoom",[this.oZoom,this.zoom]);
		return this.zoomObject;
	};

	/**
		將地圖縮放到指定的縮放等級(可能是小數)	

		index		縮放級別
		latlng		地圖中心點(由point轉化而來)
		point		滾向的地圖像素坐標點
		
		latlng和point用於滑鼠滾動放大縮小
		主用功用是做div.style.zoom的縮放--thomas chen
	*/
	PG.Map.prototype.zoomToByStyle=function(index,latlng,point)
	{		
		var maxIdx = this.zoomLevels.length - 1;		
		if(index<=0||index>=maxIdx){return;}

		//		單級縮放時
		//		在縮小時,結束層 zoom為1,起始zoom為0.5,所以divZoom從2到1(指數從1到0)
		//		增大時,結束層 zoom為1,起始zoom為2,所以divZoom從0.5到1(指數從-1到0)
		//		this.GetZoomLevel()-(this.zoomLevels[Math.ceil(index)]-this.zoomLevels[Math.floor(index)])*(index-Math.floor(index))+this.zoomLevels[Math.floor(index)]))
		//		(this.zoomLevels[Math.ceil(index)]-this.zoomLevels[Math.floor(index)]) 大於1 (在級別相距為1時體現不出來)
		//		(index-Math.floor(index))	大於0小於1		
		var divZoom;//設置縮放比例
		if(typeof(index)=="number"){
			var f_index = Math.floor(index);
			if(index==f_index){
				var indexNumber = this.zoomLevels[index]-this.GetZoomLevel();
			}else{//縮小時,指數從1變為0;	放大時指數從-1變為0				
				var indexNumber = (this.zoomLevels[Math.ceil(index)]-this.zoomLevels[f_index])*(index-f_index)-(this.GetZoomLevel()-this.zoomLevels[f_index]);
			}
			divZoom=Math.pow(2,indexNumber);
		}else{
			divZoom=1;
		}
		//ff safari4 webkit的transform 和safari4 webkit的zoom性能都不如IE,所以依然採用圖片方式
		//Zoom屬性是IE瀏覽器的專有屬性,Firefox等瀏覽器不支持.
		//它可以設置或檢索對象的縮放比例.除此之外,它還有其他一些小作用,
		//比如觸發ie的hasLayout屬性,清除浮動,清除margin的重疊等
		if(PG.Tool.isImgZoom()){
			this.mapsDvZoom(divZoom);
		}else{
			this.mapsDiv.style.zoom=divZoom;
		}
		this.divZoom=divZoom;
		if(latlng)
		{
			var zu = this.getZoomUnits(this.zoom,true);
			var zuX=zu[0]/divZoom;
			var zuY=zu[1]/divZoom;
			var viewSize=this.viewSize;
			latlng=this.MercatorToLngLat(latlng.MercatorLng+zuX*(viewSize[0]/2-point[0]),latlng.MercatorLat-zuY*(viewSize[1]/2-point[1]),false);
		}
		else
		{
			latlng=this.centerPoint;
		}
		this.setCenterAtLatLng(latlng);
		PG.Event.trigger(this,"slidezoom",[typeof(index)=="number"?index:this.zoomIndex]);
	};

	/**
		縮小一級視圖	
	*/
	PG.Map.prototype.ZoomOut=function(){if(this.zoomIndex>0){this.zoomTo(this.zoomLevels[this.zoomIndex-1]);}};
	
	/**
		放大一級視圖
	*/
	PG.Map.prototype.ZoomIn=function(){if(this.zoomIndex<this.zoomLevels.length-1){this.zoomTo(this.zoomLevels[this.zoomIndex+1]);}};
	
	/**
		地圖滑動時firefox等不支持zoom屬性的瀏覽器執行的方法

		z	縮放比例
	*/
	PG.Map.prototype.mapsDvZoom=function(z){
		if(this.slideObject){
			this.mapsDvZoomBySlide(z);
			return;
		}
		this.layerZoom(this.zoomIndex,z);
	};

	/**
		z	縮放比例
	*/
	PG.Map.prototype.mapsDvZoomBySlide=function(z){
		var layerzoom = Math.pow(2,this.zoomLevels[this.slideObject.endZIndex]-this.zoomLevels[this.slideObject.oZIndex])*z;
		this.layerZoom(this.slideObject.oZIndex,layerzoom);
	};

	/**
		設置縮放級別為idx的地圖層的所有圖片樣式(在firefox下產生層級效果的原因)----徐金評
        在zoomin ,out時,將每個image放大, 再置換圖片
		idx		地圖縮放級別
		  z		縮放比例
	*/
	PG.Map.prototype.layerZoom=function(idx,z){
		if(!idx&&idx!=0)return;
		//得到縮放級別為idx的地圖層的所有圖片
		var clds = this["mapsDiv_"+idx].getElementsByTagName("img");
		for(var i=0;i<clds.length;i++){
			clds[i].style.width=Math.ceil(this.imgSize*z)+"px";
			clds[i].style.height=Math.ceil(this.imgSize*z)+"px";
			clds[i].style.left=Math.round(clds[i].pstion[0]*z)+"px";
			clds[i].style.top=Math.round(clds[i].pstion[1]*z)+"px";
		}
	};

	/**
		加載中心經緯點為lnglat的地圖
	*/
	PG.Map.prototype.ZoomCenter = function(lnglat){
		this.setCenterAtLatLng(lnglat);
	};

	/**
		加載中心經緯點為lnglat的地圖
	*/
	PG.Map.prototype.setCenterAtLatLng=function(point)
	{
		this.centerPoint=point;
		//移動或加載地圖圖片
		this.moveMapImages(false);
	};

	/**
		將地圖的中心點變換到指定的地理坐標
		如果移動範圍不大,則執行一個滑動過程
		如果同時指定了縮放等級,則同時滑動到指定的等級

		point：地圖滑動之後的中心點
		zoom：指定的縮放級別
		mtype 沒有用到
	*/
	PG.Map.prototype.ZoomPan=function(point,zoom,mtype)
	{
		if(!this.loaded)
		{	
			this.centerAndZoom(point,zoom);
			return;
		}
		if(PG.BrowserInfo.isIE())
		{
			try{document.selection.empty();}catch(e){}
		}
		if(typeof(zoom)=="number"){this.zoomTo(zoom);}
		var fromPoint=this.centerPoint;
		var distanceX=point.MercatorLng-fromPoint.MercatorLng;
		var distanceY=point.MercatorLat-fromPoint.MercatorLat;
		if(distanceX==0  && distanceY==0)
		{//如果不需要移動,則直接退出
			return;
		}
		var units=this.getZoomUnits(this.zoom,true);
		var viewSize=this.viewSize;
		if(Math.abs(distanceX)>viewSize[0]*units[0]*2 || Math.abs(distanceY)>viewSize[1]*units[1]*2)
		{//如果需要移動的範圍比較大,則直接定位,不執行滑動過程
			this.setCenterAtLatLng(point);
			PG.Event.trigger(this,"OnMoveEnd",[this.centerPoint,mtype]);
			return;
		}
		if(!this.slideObject)
		{
			this.slideObject={timeout:window.setInterval(PG.Event.getCallback(this,this.slide),16)};
		}
		PG.Tool.inherit(this.slideObject,{toPoint:point,mtype:mtype,number:0});
		this.slide();
		PG.Event.trigger(this,"OnMoveStart",[this.centerPoint]);
	};

	/**
		地圖滑動時持續執行的函數---徐金評
	*/
	PG.Map.prototype.slide=function()
	{
		var num=this.slideNum;
		var slideObject=this.slideObject;
		if(!slideObject){return;}
		if(slideObject.number>=num)
		{
			//ff縮放
			if(PG.Tool.isImgZoom()){
				this.layerZoom(slideObject.endZIndex,1);
			}
			this.slideEnd();
			return;
		}
		if(slideObject.number==0)
		{//toPoint為地圖滑動之後的中心點---徐金評
			if(slideObject.toPoint)
			{//計算需要滑動的經度和緯度,以及滑動的距離---徐金評
				var distanceX=slideObject.toPoint.MercatorLng-this.centerPoint.MercatorLng;
				var distanceY=slideObject.toPoint.MercatorLat-this.centerPoint.MercatorLat;
				var distance=Math.sqrt(Math.pow(distanceX,2)+Math.pow(distanceY,2));
				PG.Tool.inherit(slideObject,{fromPoint:this.centerPoint,distanceX:distanceX,distanceY:distanceY,distance:distance});
			}
			if(typeof(slideObject.endZIndex)=="number")
			{
				slideObject.changeZIndex=false;
			}
		}
		slideObject.number++;
		//重新設置地圖中心點---徐金評
		if(slideObject.toPoint)
		{
			//滑動的距離
			var slideDistance=slideObject.distance;
			//每次滑動的像素
			var slideMaxPixel=slideDistance*(Math.sin(Math.PI*(slideObject.number/num-0.5))/2+0.5);
			if(slideDistance!=0){
				this.centerPoint=this.MercatorToLngLat(slideObject.fromPoint.MercatorLng+slideMaxPixel*slideObject.distanceX/slideDistance,slideObject.fromPoint.MercatorLat+slideMaxPixel*slideObject.distanceY/slideDistance,false);
			}
			this.toCenter();
		}

		//將地圖縮放到指定的縮放等級
		//endZIndex為最後的縮放級別在PG._map_zoomLevels中的下標
		if(typeof(slideObject.endZIndex)=="number")
		{
//			前一半oZIndex在上,後一半endZIndex在上,如果endZIndex沒加載完畢,會蓋在oZIndex之上
			if(slideObject.number>=num/2 && !slideObject.changeZIndex)
			{
//				ff緩動結束換層
				if(!PG.Tool.isImgZoom()){
					this.setTopMapDiv(slideObject.endZIndex);
					slideObject.changeZIndex=true;
				}
			}

//			因為比例尺是和以前是相反的,所以改動

//lee註釋	Math.PI*(slideObject.number/num-0.5),180度乘以小數(乘以一個弧度),pi==180度,減0.5相當於減90度
//			就是說區間其實在-90度和+90度之間,這之間的正弦為遞增的(區間為負一到正一),
//			運動規律是先緩(-90度)後急(0度),再緩(90度)

//lee註釋	(Math.sin(Math.PI*(slideObject.number/num-0.5))+1)/2    -0.5到+0.5,按照正弦曲線進行增長			
			slideObject.zIndex=slideObject.startZIndex-(slideObject.startZIndex-slideObject.endZIndex)*(Math.sin(Math.PI*(slideObject.number/num-0.5))+1)/2;
			this.zoomToByStyle(slideObject.zIndex);
		}
	};

	/**
		輪換設置最上層mapsDiv
	*/
	PG.Map.prototype.setTopMapDiv=function(index)
	{
		if(this.focusMapsDiv)
		{
			PG.Tool.setZIndex(this.focusMapsDiv,60);
		}
		this.focusMapsDiv=this["mapsDiv_"+index];
		PG.Tool.setZIndex(this.focusMapsDiv,100);
	};

	/**
		地圖滑動結束後執行
	*/
	PG.Map.prototype.slideEnd=function()
	{
		var slideObject=this.slideObject;
		
		this.slideObject=null;
//		結束再顯示圖片,提高性能
		if(PG.Tool.isImgZoom()){
			
//			PG.MapTileMgr中會用到判斷作為結束的條件
			var tmptile;
			while(tmptile = this.tileMgr.slideImgs.shift()){
				this.showMapImage(tmptile[0],tmptile[1],tmptile[2],tmptile[3]);
			}
		}
		//觸發縮放以後end層的OnShowImg,提高疊加層縮放速度
		var tp;
		while(tp = this.tileMgr.slideImgs.shift()){
			PG.Event.trigger(this,"OnShowImg",tp);
		}
		
		window.clearInterval(slideObject.timeout);
		if(slideObject.toPoint)
		{
			this.setCenterAtLatLng(slideObject.toPoint);
			PG.Event.trigger(this,"OnMoveEnd",[this.centerPoint,slideObject.mtype]);
		}
		if(typeof(slideObject.endZIndex)=="number")
		{
			if(!slideObject.changeZIndex)
			{
				this.setTopMapDiv(slideObject.endZIndex);
			}
			this.zoomToByStyle();
			delete this.oZoom;
			PG.Event.trigger(this,"OnZoomEnd",[this.zoomLevels[slideObject.endZIndex]]);
		}
		this.container.scrollLeft = "0px";
		this.container.scrollTop = "0px";
	};

	/**
		將地圖緩動指定的像素單位
		例如參數為new PG.Size(100,100)則代表地圖向右、下方向分別滑動100個像素單位
		參數為PG.Size(-100,0)代表地圖向左滑動100個像素單位
	*/
	PG.Map.prototype.PanBy = function(size){
		this.move([size.width,size.height]);
	};

	/**
		將地圖緩動指定的像素單位
	*/
	PG.Map.prototype.move=function(size)
	{//地圖移動指定的像素值
		this.ZoomPan(this.fromContainerPixelToLatLng([this.viewSize[0]/2+size[0],this.viewSize[1]/2+size[1]]));
	};

	/**
		以動畫方式向指示方向平移地圖寬度的一半
		+1 是向右向下,-1 是向左向上
	*/
	PG.Map.prototype.PanDirection = function(dx,dy){
		this.move([this.viewSize[0]/2*dx,this.viewSize[1]/2*dy]);
	};
	//以下是為了和接口兼容而創建的方法,都是調用move方法實現
	PG.Map.prototype.mapMoveToUp=function(num){this.move([0,-num*this.imgSize]);};
	PG.Map.prototype.mapMoveToRight=function(num){this.move([num*this.imgSize,0]);};
	PG.Map.prototype.mapMoveToDown=function(num){this.move([0,num*this.imgSize]);};
	PG.Map.prototype.mapMoveToLeft=function(num){this.move([-num*this.imgSize,0]);};


	/**
		地圖被雙擊時執行的操作
	*/
	PG.Map.prototype.onDoubleClick=function(e)
	{
		PG.Event.cancelBubble(e);
		if(!this.loaded){return;}
		var point=PG.Tool.getEventPosition(e,this.container);
//		第二個參數可以被各個監聽器改寫,來判斷是否執行一些行為
		var config = {};
		var p = new PG.Point(point[0],point[1]);
		PG.Event.trigger(this,"OnDblClick",[p,config]);
//		config.isStop在測距側面時會被設置一個標記量isStop,用來取消地圖默認操作
		var point=this.fromContainerPixelToLatLng(p);
		if(this.canDrag && !config.isStop){
			if(this.enableDblZoom){
				var map = this;
				if(map.GetZoomLevel()<this._maxLevel){
					var lnglat = map.WindowToWorld(p);
					var viewMap = map.GetWindow();
					var dis = [p.x - viewMap.width/2,p.y - viewMap.height/2];
					var zu = map.getZoomUnits(map.GetZoomLevel()+1);
					var center = map.GetCenter();
					var lng = center.MercatorLng + dis[0]*zu;
					var lat = center.MercatorLat - dis[1]*zu;
					map.SetCenter(this.MercatorToLngLat(lng,lat,false));
					map.ZoomIn();
				}
			}else if(this.dbclickToCenter)
			{
				this.ZoomPan(point,null,"m_dblclick");
			}
		}
	};

	/***
		滑鼠滑過時執行的操作
	*/
	PG.Map.prototype.onContainerMouseMove = function(e){
		var btn = PG.Tool.getEventButton(e);
		var p = PG.Tool.getEventPosition(e,this.container);
		//傳回螢幕座標
		PG.Event.trigger(this,"OnMouseMove",[new PG.Point(p[0],p[1]),btn]);
	};

	/***
		滑鼠滑過時執行的操作
	*/
	PG.Map.prototype.onContainerMouseOver = function(e){
		var btn = PG.Tool.getEventButton(e);
		var p = PG.Tool.getEventPosition(e,this.container);
		PG.Event.trigger(this,"OnMouseOver",[new PG.Point(p[0],p[1]),btn]);
	};

	/***
		滑鼠按下時執行的操作
	*/
	PG.Map.prototype.onMouseDown=function(e)
	{//開始拖動過程
		if(!e.touches){
			PG.Event.cancelBubble(e);
		}
		
		if(e.preventDefault){
			e.preventDefault();
		}
		
		var evtm = "mousemove";
		var evtup = "mouseup";
		if(e.touches){
			var e = e.touches[0]; // 獲取#1號手指的信息
			evtm = "touchmove";
			evtup = "touchend";
		}

		//处理双击事件
		if(PG.Tool.browserInfo().isMwk&&this.IsDoubleClickZoom()){
			var _dbl = true;
			if(!this.dblTime){
				this.dblTime = (new Date()).getTime();//第一次touchstart的时间
				_dbl = false;
			}
			if(_dbl){	
				//计算第一次和第二次touchstart的时间差,并和系统默认值比较,若小于则触发双击事件
				if(((new Date()).getTime() - this.dblTime)<window.PG._dbl_tapTime){	
					this.dblTime = false;
					this.onDoubleClick(e);
					return;
				}
				this.dblTime = false;
			}			
		}

		if(this.dragObject){this.dragEnd(e);}
		if(!this.loaded){return;}
		
		if(this.bInfo.isMwk){
			this.stopLoad = true;
		}
		var dragObject={"startPoint":PG.Tool.getEventPosition(e,this.container),"startDivPoint":[e.clientX,e.clientY],"startTime":(new Date()).getTime()};
		this.dragObject=dragObject;
		if(this.container.setCapture)
		{
			this.container.setCapture();
		}
		if(this.canDrag)
		{
			dragObject.centerPoint=this.centerPoint;
			//換成拖曳遊標
			PG.Tool.setCursorStyle(this.mapsDiv,this.mapCursor[1]);
			PG.Tool.setCursorStyle(this.container,this.mapCursor[1]);
			PG.Event.trigger(this,"OnMoveStart",[this.centerPoint]);
		}
		dragObject.enableDrag=false;
		if(!dragObject.timeout)
		{
			dragObject.timeout=window.setInterval(PG.Event.getCallback(this,function(){if(this.dragObject){this.dragObject.enableDrag=true;}}),32);
		}
		if(!dragObject.mouseMoveListener)
		{//觸發拖動事件以改變地圖
			dragObject.mouseMoveListener=PG.Event.bind(document,evtm,this,this.onMouseMove);
		}
		if(!dragObject.mouseUpListener)
		{
			dragObject.mouseUpListener=PG.Event.bind(document,evtup,this,this.onMouseUp);
		}
		var btn = PG.Tool.getEventButton(e);
		var p =dragObject.startPoint;
		PG.Event.trigger(this,"OnMouseDown",[new PG.Point(p[0],p[1]),btn]);
		if(PG.BrowserInfo.isIE())
		{
			try{document.selection.empty();}catch(e){}
		}
	};

	/***
		滑鼠按下時執行的操作
		地圖拖動
	*/
	PG.Map.prototype.onMouseMove=function(e)
	{//地圖拖動
		PG.Event.cancelBubble(e);
		//for IE
		if(e.preventDefault){
			e.preventDefault();
		}
		if(e.touches){
			var e = e.touches[0]; // 獲取#1號手指的信息
		}
		var dragObject=this.dragObject;
		if(!dragObject || !dragObject.enableDrag)
		{
			return;
		}
		var dragStartDivPoint=dragObject.startDivPoint;
		var dragCenterPoint=dragObject.centerPoint;
		var dragPoint=[e.clientX-dragStartDivPoint[0],e.clientY-dragStartDivPoint[1]];
//		註釋掉,cpu使用率會提高,不過效果會變好
		dragObject.enableDrag=false;
		if(this.canDrag)
		{
			var units=this.getZoomUnits(this.zoom,true);
			if(dragCenterPoint){
				this.centerPoint=this.MercatorToLngLat(dragCenterPoint.MercatorLng+(-dragPoint[0]*units[0]),dragCenterPoint.MercatorLat+dragPoint[1]*units[1],false);
			}
			this.toCenter();

			if(this.isMapFast){
				var _this = this;
				if(this.time_delay){
					window.clearTimeout(this.time_delay);
				}
				this.time_delay = window.setTimeout(function(){
														if(!_this.stopLoad){
															_this.moveMapImages(false);
														}
													},100);
			}else{
				if(!this.stopLoad)
				{
					this.moveMapImages(false);
				}
			}
		}
		PG.Event.trigger(this,"OnMouseDrag",[new PG.Point(dragPoint[0],dragPoint[1]),PG.Tool.getEventButton(e)]);
	};

	/***
		結束拖動過程
	*/
	PG.Map.prototype.onMouseUp=function(e)
	{		
//		提高手機性能
		if(this.bInfo.isMwk){
			this.stopLoad = false;
		}
		
		PG.Event.cancelBubble(e);
		
		if(e.preventDefault){
			e.preventDefault();
		}
		
		if(e.changedTouches){
			var e = e.changedTouches[0]; // 獲取#1號手指的信息
		}
		var point=PG.Tool.getEventPosition(e,this.container);
		this.dragEnd(e);
		if(document.releaseCapture)
		{
			document.releaseCapture();
		}
		//回復cursor
		PG.Tool.setCursorStyle(this.mapsDiv,this.mapCursor[0]);
		PG.Tool.setCursorStyle(this.container,this.mapCursor[0]);
		//觸發事件
		PG.Event.trigger(this,"OnMouseUp",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)]);
	};

	/***
		中止拖動進程
	*/
	PG.Map.prototype.dragEnd=function(e)
	{
		var dragObject=this.dragObject;
		if(dragObject)
		{
			if(dragObject.timeout)
			{
				window.clearInterval(dragObject.timeout);
				dragObject.timeout=null;
			}

			dragObject.enableDrag=true;
			this.onMouseMove(e);
			if(dragObject.mouseMoveListener)
			{
				PG.Event.removeListener(dragObject.mouseMoveListener);
				dragObject.mouseMoveListener=null;
			}
			if(dragObject.mouseUpListener)
			{
				PG.Event.removeListener(dragObject.mouseUpListener);
				dragObject.mouseUpListener=null;
			}
			var dragStartDivPoint=this.dragObject.startDivPoint;
			if((new Date()).getTime()-this.dragObject.startTime<=500&&(Math.abs(dragStartDivPoint[0]-e.clientX)<=2&&Math.abs(dragStartDivPoint[1]-e.clientY)<=2))
			{
				var point=PG.Tool.getEventPosition(e,this.container);
				PG.Event.trigger(this,"OnClick",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)])
			}
			else
			{
				PG.Event.trigger(this,"OnMoveEnd",[this.centerPoint,"m_drag"]);
			}
			this.dragObject=null;
		}
	};
	
	/***
		判斷模式是否被佔用,eventName是模式名稱
	*/
	PG.Map.prototype.isOccupy = function()
	{
		return this._occupy?true:false;
	};

	/***
		開始佔用地圖的eventName模式---主要是防止同時打開幾個工具類
	*/
	PG.Map.prototype.startOccupy = function(name)
	{
		if(!this._occupy)
		{
			this._occupy=name;
			return true; 
		}
		else
		{
			alert("請先結束 " + this._occupy + " 操作!");
		}
		return false;
	};

	/***
		結束佔用地圖的eventName模式,什麼地方用
	*/
	PG.Map.prototype.endOccupy = function(name)
	{
		if(this._occupy==name)
		{
			this._occupy=null;
			return true;
		}
		return false;
	};

	/***
		
	*/
	PG.Map.prototype.isDragging = function()
	{
		return this.canDrag;
	};

	/***
		啟動地圖拖動操作
	*/
	PG.Map.prototype.EnableDrag = function()
	{
		this.canDrag=true;
	};

	/***
		禁用地圖拖動操作
	*/
	PG.Map.prototype.DisableDrag = function()
	{
		this.canDrag=false;
	};

	/***
		檢查地圖是否可以拖動
	*/
	PG.Map.prototype.IsDrag = function(){
		return !!this.canDrag;
	};

	/***
		獲取緩動等級
	*/
	PG.Map.prototype.GetSlideMaxZoom = function(){
		return this.slideMaxZoom;
	};

	/***
		設置緩動效果的等級
	*/
	PG.Map.prototype.SetSlideMaxZoom=function(z)
	{
		this.slideMaxZoom=parseInt(z);
	};

	/***
		設置地圖的滑鼠樣式
	*/
	PG.Map.prototype.SetMapCursor=function(normalCursor,dragCursor)
	{
		var mapCursor=this.mapCursor;
		if(normalCursor){mapCursor[0]=normalCursor;}
		if(dragCursor){mapCursor[1]=dragCursor;}
		var cursor=this.dragObject?mapCursor[1]:mapCursor[0];
		PG.Tool.setCursorStyle(this.container,cursor);
		PG.Tool.setCursorStyle(this.mapsDiv,cursor);
	};

	/***
		地圖禁止拖動狀態下被單擊時執行本方法來觸發maps的click事件
	*/
	PG.Map.prototype.onClick=function(e)
	{
		if(this.canDrag || !this.loaded)
		{
			return;
		}
		var point = PG.Tool.getEventPosition(e,this.container);
		PG.Event.trigger(this,"OnClick",[new PG.Point(point[0],point[1]),1]);
	};

	/***
		返回event事件發生點對應的經緯度
	*/
	PG.Map.prototype.getClickLatLng=function(e)
	{
		if(typeof(e[0])=="number")
		{
			return this.fromContainerPixelToLatLng(e);
		}
		else
		{
			return this.fromContainerPixelToLatLng(PG.Tool.getEventPosition(e,this.container));
		}
	};

	/***
		返回當前container中顯示的地圖的經緯度範圍,返回一個PG.Size

		注意：
		由於API簡化,PG.Size不再作為專門的對象開放,
		而在這個返回對像裡面生成相應的屬性和方法以保持兼容
	*/
	PG.Map.prototype.getSpanLatLng=function()
	{
		var bounds=this.getBoundsLatLng();
		var size={width:parseInt(bounds.XmaxMercator-bounds.XminMercator),height:parseInt(bounds.YmaxMercator-bounds.YminMercator)};
		size.getWidth=function(){return this.width};
		size.getHeight=function(){return this.height};
		return size;
	};

	/***
		返回map容器的內容
	*/
	PG.Map.prototype.getMapContent=function(flag)
	{
		var viewSize=this.viewSize;
		var style=this.mapsDiv.style;
		var html="<div id='EnjoyMaps_Container' style='width:"+viewSize[0]+"px;height:"+viewSize[1]+"px;overflow:hidden'>";
		//地圖圖片層
		html+="<div id='EnjoyMaps_Maps' style='position:absolute;left:"+style.left+";top:"+style.top+"'>";
		html+=this.mapsDiv.innerHTML;
		if(flag!=1)
		{//地圖標記層
			html+=this.overlaysDiv.outerHTML;
		}
		html+='</div>';
		html+='</div>';
		var offImgURL=window.PG._map_offImgURL;
		var imgURLs=this.imgURLs;
		if(offImgURL && offImgURL!="")
		{
			for(var i=0;i<imgURLs.length;i++)
			{
				html=html.replace(new RegExp(imgURLs[i].replace(new RegExp("([\\?\\$\\+\\.\\(\\)\\*\\.\\[\\\\\\^\\{\\|])","g"),"\\$1"),"g"),offImgURL);
			}
		}
		return html;
	};
	
	/**
		將地圖視景移到全圖範圍,會以滑動效果展示視景的變更
	*/
	PG.Map.prototype.ZoomAll = function(){
		if(this.ZoomAllRange){			
			if(this.hasSetRange){
				this.ZoomPan(this.ZoomAllRange.GetCenter(),this.zoomLevels[this.zoomLevels.length-1]);	
			}else{
				this.SetRange(this.ZoomAllRange);
			}
		}
	};


	/**
		設地圖視景的全圖範圍

		r	: PG.Rect(經緯度全國範圍)
		
	*/
	PG.Map.prototype.SetRange=function(r)
	{
		if(!r){return;}
		this.ZoomAllRange = r;
		this.ZoomPan(r.GetCenter(),this.toLegal(this.getBestZoom(r)));	
		this.hasSetRange = true;
	};

	/**
		取全圖視景的經緯度範圍
				
	*/
	PG.Map.prototype.GetRange=function()
	{
		return this.ZoomAllRange;
	};

	/***
		根據指定的範圍計算最佳的縮放等級

		將地圖視景移至至少能包含指定範圍PG.Rect,不以滑動效果展示

	*/
	PG.Map.prototype.SetViewport = function(PG_Rect){
		this.zoomTo(this.toLegal(this.getBestZoom(PG_Rect)));
	};

	/***
		根據指定的範圍計算最佳的縮放等級
	*/
	PG.Map.prototype.GetViewportZoomLevel = function(bounds,padding){
		return this.getBestZoom(bounds,padding);
	};

	/***
		根據指定的範圍計算最佳的縮放等級
	*/
	PG.Map.prototype.getBestZoom=function(bounds,padding)
	{
		padding=(typeof(padding)=="number")?padding:10;
		var viewSize=this.viewSize;
		var zoomLevels=this.zoomLevels;
		var zoomLevelsLen=zoomLevels.length;
		var index;
		
		for(index=zoomLevelsLen-1;index>0;index--)
		{
			var zoomUnits=this.getZoomUnits(zoomLevels[index],true);
			var a = (bounds.XmaxMercator-bounds.XminMercator)/zoomUnits[0]<viewSize[0]-padding;
			var b = (bounds.YmaxMercator-bounds.YminMercator)/zoomUnits[1]<viewSize[1]-padding;
			if(a && b){break;}
		}
		return zoomLevels[index];
	};

	/***
		將地圖定位到能包含指定點的最佳視圖
	*/
	PG.Map.prototype.SetCoverViewport=function(points,padding)
	{
		if(points.length==0){return;}
		var bounds=PG.Rect.GetPointsBounds(points);
		this.centerAndZoom(bounds.GetCenter(),this.getBestZoom(bounds,padding));
	};

	/***
		返回當前地圖中心點的比例尺,即一個像素代表的實際距離,單位為米

		這個方法有問題,point不知道是什麼,會報錯----徐金評 
		參照PG.ScaleControl.prototype.initialize和PG.ScaleControl.prototype.resetScale
		point為地圖中心點
	*/
	PG.Map.prototype.GetScale = function(){
		var bounds=this.GetViewport();
		var point=this.GetCenter();
		if(this.GetZoomLevel()<5){
			var lngMin = new PG.Point(8000000,point.GetY(),false);
			var lngMax = new PG.Point(14000000,point.GetY(),false);
			var pxDis = this.fromLatLngToContainerPixel(lngMax)[0] - this.fromLatLngToContainerPixel(lngMin)[0];
			var dis = PG.Tool.getPointsDistance(lngMin,lngMax)/pxDis;
		}else{
			var dis = PG.Tool.getPointsDistance(new PG.Point(bounds.left,point.y,false),new PG.Point(bounds.right,point.y,false))/this.viewSize[0];
		}
		return dis;
	};
	
	/***
		快速移動地圖的標識,isMapFast用於滑鼠按下時移動地圖
	*/
	PG.Map.prototype.moveFast = function(){
		this.isMapFast = true;
	};

	/***
		慢速移動地圖的標識,isMapFast用於滑鼠按下時移動地圖
	*/
	PG.Map.prototype.moveSlow = function(){
		this.isMapFast = false;
	};

	/***
		設置地圖容器的背景顏色
	*/
	PG.Map.prototype.setBgColor = function(c){
		this.container.style.background = c;
	};

	/***
		設置地圖容器的背景圖片
	*/
	PG.Map.prototype.setBgImage = function(url){
		if(url){
			this.container.style.background = "url("+url+")";
		}else{
			this.container.style.background = "url("+window.PG._map_bgImg+")";
		}
	};
	
	/***
		關於滑鼠滾輪滑動的方法
		打開滑鼠滑動縮放等級的支持
		flag=true是代表已滑鼠指向點作為滑動的中心
	*/
	PG.Map.prototype.EnableMouseWheelZoom = function(flag){
		this.handleMouseScroll(flag);
	};

	/***
		禁用滑鼠滾輪縮放地圖功能
	*/
	PG.Map.prototype.DisableMouseWheelZoom = function(){
		this.clearHandleMouseScroll();
	};

	/***
		設置滾輪向上(1)時為放大或向下(非1)時為縮放
	*/
	PG.Map.prototype.SetMouseWheel_UpDownMode = function(mode){
		this.ZoomByMouseWheel_WheelUpDown = mode;
	};

	/***
		是否啟用滑鼠滾輪縮放地圖功能
	*/
	PG.Map.prototype.IsMouseWheelZoom = function(){
		return !!this.msl;
	};

	/***
		滑鼠滾動時執行
	*/
	PG.Map.prototype.handleMouseScroll=function(flag)
	{
		this.clearHandleMouseScroll();//如果已經打開,則關閉支持
		var event = PG.BrowserInfo.isFF()?"DOMMouseScroll":"mousewheel"; 
		this.msl=PG.Event.bind(this.container,event,this,this.onMouseWheel);//在滑鼠滾輪被滑動的時候執行操作
		this.wheelByPoint=flag;//指定滑鼠滾輪滑動中心是固定模式還是以滑鼠指向點為中心
		
		//設置滾輪縮放時的指示按鈕,會出現矩形的紅框
		this._mfgc = new PG.MagnifyingglassControl();
		this.AddControl(this._mfgc);
	};

	/***
		關閉滑鼠滾動的支持
	*/
	PG.Map.prototype.clearHandleMouseScroll=function()
	{
		if(this.mst){this.onStopMouseWheel();}//如果正在滑動,則先停止滑動
		if(this.msl){PG.Event.removeListener(this.msl);this.msl=null;}//取消滾輪事件綁定		
		this._mfgc||this.RemoveControl(this._mfgc,true);
		this._mfgc = null;
		delete this._mfgc;
	};

	/***
		在滑鼠滾動事件發生時執行
		滾輪縮放事件中, 對一張div做出隨滾輪縮放的效果
	*/
	PG.Map.prototype.onMouseWheel=function(e)
	{
		PG.Event.cancelBubble(e);
		if(this.slideObject){this.slideEnd();}//如果正在做地圖的滑動,則先停止滑動
		if(typeof(this.mzi)!="number")
		{
			this.mzi=this.zoomIndex;
			this.wheelPoint=PG.Tool.getEventPosition(e,this.container);
			this.wheelLatlng=this.fromContainerPixelToLatLng(this.wheelPoint);
		}
		var wheelDelta=(typeof(e.wheelDelta)=="number")?-e.wheelDelta:(+e.detail*40);
		if(this.ZoomByMouseWheel_WheelUpDown == 1){
			this.mzi+=wheelDelta/600;
		}else{
			this.mzi-=wheelDelta/600;
		}

		if(this.mzi>this.zoomLevels.length-1){this.mzi=this.zoomLevels.length-1}
		if(this.mzi<0){this.mzi=0}
		if(this.isZoomSlide&&this.slideMaxZoom>0)
		{
			if(this.isZoomSlide){
				var index=(this.mzi>this.zoomIndex)?Math.ceil(this.mzi):Math.floor(this.mzi);
			}else{
				var index=(this.mzi>this.zoomIndex)?Math.floor(this.mzi):Math.ceil(this.mzi);
			}
			var zoom=this.zoomLevels[index];
			PG.Event.trigger(this,"OnZoomStart",[this.zoom,zoom,e]);
			
			if(this.wheelByPoint)
			{
				this.zoomToByStyle(this.mzi,this.wheelLatlng,this.wheelPoint);
			}
			else
			{
				//避免二次縮放--thomas chen
				//this.zoomToByStyle(this.mzi);
			}
		}
		else
		{
//			不支持緩動縮放效果的時候調用,目前應該已經沒有用了
			var zoom=this.zoomLevels[Math.round(this.mzi-2*wheelDelta/600)];
//			非IE下大約滾3下才能累加一次縮放
//			var zoom=this.zoomLevels[Math.round(this.mzi)];
			if(zoom==this.zoom){return;}
			this.zoomTo(zoom);
/*該功能用來在firefox下滑動滑鼠的時候改變地圖的位置以保證滑鼠指向處的視圖不變,因為firefox的一個bug因此無法啟用,詳情請看：
//http://www.nabble.com/DOMMouseScroll-and-event-properties-clientX,-clientY,-pageX,-pageY-t2207317.html
			if(this.wheelByPoint)
			{
				var zoomUnits=this.getZoomUnits(zoom);
				var latlng=this.MercatorToLngLat(this.wheelLatlng.MercatorLng+zoomUnits*(this.viewSize[0]/2-this.wheelPoint[0]),this.wheelLatlng.MercatorLat-zoomUnits*(this.viewSize[1]/2-this.wheelPoint[1]),false);
				this.setCenterAtLatLng(latlng);
			}
*/
		}
		if(this.mst){window.clearTimeout(this.mst);this.mst=null;}
		this.mst=window.setTimeout(PG.Event.getCallback(this,this.onStopMouseWheel),350);
		return;
	};

	/***
		停止滑鼠滾動時執行的函數
	*/
	PG.Map.prototype.onStopMouseWheel=function()
	{
		if(this.isZoomSlide){
			var index=(this.mzi>this.zoomIndex)?Math.ceil(this.mzi):Math.floor(this.mzi);
		}else{
			var index=(this.mzi>this.zoomIndex)?Math.floor(this.mzi):Math.ceil(this.mzi);
		}
		var zoom=this.zoomLevels[index];
		if(this.wheelByPoint)
		{
			var zoomUnits=this.getZoomUnits(zoom,true);
			this.ZoomPan(this.MercatorToLngLat(this.wheelLatlng.MercatorLng+zoomUnits[0]*(this.viewSize[0]/2-this.wheelPoint[0]),this.wheelLatlng.MercatorLat-zoomUnits[1]*(this.viewSize[1]/2-this.wheelPoint[1]),false),zoom);
		}
		else
		{
			this.zoomTo(zoom);
		}
		window.clearTimeout(this.mst);
		this.mst=null;
		this.mzi=null;
	};

	/**
		啟用雙擊縮放地圖
	*/
	PG.Map.prototype.EnableDoubleClickZoom = function(){
		this.enableDblZoom = true;
	};

	/***
		禁用雙擊縮放地圖
	*/
	PG.Map.prototype.DisableDoubleClickZoom = function(){
		this.enableDblZoom = false;
	};

	/***
		當且僅當啟用了雙擊縮放地圖時,返true
	*/
	PG.Map.prototype.IsDoubleClickZoom = function(){
		return !!this.enableDblZoom;
	};

	/***
		啟用鍵盤操作支持
		任何時候頁面上最多有一個地圖正在使用鍵盤事件
	*/
	PG.Map.prototype.EnableKeyboardPilot = function(){
		this.handleKeyboard();
	};

	/***
		禁用鍵盤操作支持
	*/
	PG.Map.prototype.DisableKeyboardPilot = function(){
		this.clearHandleKeyboard();
	};

	/***
		是否啟用鍵盤控制功能
	*/
	PG.Map.prototype.IsKeyboardPilot = function(){
		return !!PG.Map.kdl;
	};

	/***
		啟用鍵盤操作支持
	*/
	PG.Map.prototype.handleKeyboard=function()
	{
		this.clearHandleKeyboard();	//如果前面已經有鍵盤操作支持
		PG.Map.kdl=PG.Event.bind(document,"keydown",this,this.onKeyDown);//在鍵盤上的鍵被按下的時候執行操作
		PG.Map.kul=PG.Event.bind(document,"keyup",this,this.onKeyUp);//在鍵盤上的鍵被釋放的時候執行操作
	};

	/***
		取消鍵盤操作支持
		這個函數實際上是一個靜態的,也就是說假如頁面上有多個地圖實例,
		調用任何一個地圖的該方法都會取消鍵盤操作
	*/
	PG.Map.prototype.clearHandleKeyboard=function()
	{
		if(PG.Map.kdl){PG.Event.removeListener(PG.Map.kdl);PG.Map.kdl=null;}
		if(PG.Map.kul){PG.Event.removeListener(PG.Map.kul);PG.Map.kul=null;}
		if(PG.Map.mmt){window.clearInterval(PG.Map.mmt);PG.Map.mmt=null;}
	};

	/***
		鍵盤被按下的時候執行
		在按下的時候主要開始地圖的滑動過程
	*/
	PG.Map.prototype.onKeyDown=function(e)
	{
		if(!PG.Map.isMapKey(e)){return;}//判斷是否應該由地圖來處理該事件
		if(!PG.Map.move){PG.Map.move=[0,0];}//PG.Map.move用來記錄地圖的滑動方向
		var move=PG.Map.move;
		//判斷地圖上的按方向鍵的按下狀態,根據狀態變化地圖的滑動方向
		switch(e.keyCode)
		{
			case 37:
				move[0]=-10;
				break;
			case 38:
				move[1]=-10;
				break;
			case 39:
				move[0]=10;
				break;
			case 40:
				move[1]=10;
				break;
		}
		if(!PG.Map.mmt)
		{
			//開始持續滑動
			PG.Event.trigger(this,"OnMoveStart",[this.centerPoint]);
			PG.Map.mmt=window.setInterval(PG.Event.getCallback(this,this.continuousMove),32);
		}
	};

	/***
		本函數將會在地圖方向鍵被按下的時候持續執行
		將地圖向指定的方向移動
	*/
	PG.Map.prototype.continuousMove=function()
	{
		this.setCenterAtLatLng(this.fromContainerPixelToLatLng([this.viewSize[0]/2+PG.Map.move[0],this.viewSize[1]/2+PG.Map.move[1]]));
	};

	/***
		本函數判斷指定的事件是否應該由地圖來處理

		當按下鍵盤上的鍵時執行,以判斷是否為地圖操作
	*/
	PG.Map.isMapKey=function(e)
	{
		if(e.ctrlKey||e.altKey||e.metaKey)//如果按下了控制鍵,則不處理
		{
			return false;
		}
		if((e.target.nodeName=="INPUT" && e.target.type=="text") || e.target.nodeName=="TEXTAREA")//如果當前的焦點在輸入框上,則不處理
		{
			return false;
		}
		return true;
	};

	/***
		在鍵盤上的鍵被釋放的時候執行
	*/
	PG.Map.prototype.onKeyUp=function(e)
	{
		if(!PG.Map.isMapKey(e)){return;}
		switch(e.keyCode)
		{
			case 187://大鍵盤上的+
			case 107://小鍵盤上的+
			case 61:
				this.ZoomIn();
				break;
			case 189://大鍵盤上的-
			case 109://小鍵盤上的-
				this.ZoomOut();
				break;
			case 33://PageUp鍵
			case 87://W鍵
			case 104://小鍵盤上的8
				this.move([0,-this.viewSize[1]/2]);
				break;
			case 34://PageDown鍵
			case 83://S鍵
			case 98://小鍵盤上的2
				this.move([0,this.viewSize[1]/2]);
				break;
			case 35://Home鍵
			case 68://D鍵
			case 102://小鍵盤上的6
				this.move([this.viewSize[0]/2,0]);
				break;
			case 36://End鍵
			case 65://A鍵
			case 100://小鍵盤上的4
				this.move([-this.viewSize[0]/2,0]);
				break;
			case 37://左
			case 39://右
				if(PG.Map.move){PG.Map.move[0]=0;}
				break;
			case 38://上
			case 40://下
				if(PG.Map.move){PG.Map.move[1]=0;}
				break;
			case 101://小鍵盤上的5
				this.returnToSavedPosition();
				break;
		}
		//如果所有方向鍵都已經釋放,則停止滑動定時執行
		if(PG.Map.mmt && PG.Map.move[0]==0 && PG.Map.move[1]==0)
		{
			window.clearInterval(PG.Map.mmt);
			PG.Map.mmt=null;
			PG.Event.trigger(this,"OnMoveEnd",[this.centerPoint,"m_scroll"]);
		}
	};

	/***
		返回默認的信息窗口
	*/
	PG.Map.prototype.getDefaultInfoWin=function()
	{
		return this._MarkerInfoWin?this._MarkerInfoWin:(window.PG.InfoWindow?new window.PG.InfoWindow():null);
	};

	/***
		增加甩動地圖效果,類似於google maps  (默認不打開)

		注意：手機版不支持。
	*/
	PG.Map.prototype.EnableInertia=function(){
		this._S_M_M_E = new PG.MapEffect(this);
	};

	/***
		去掉甩動地圖效果

		注意：手機版不支持。
	*/
	PG.Map.prototype.DisableInertia=function(){
		if(this._S_M_M_E){
			this._S_M_M_E.depose();
			this._S_M_M_E = null;
		}
	};

	/***
		是否打開甩動地圖效果
	*/
	PG.Map.prototype.IsInertia=function(){
		return !!this._S_M_M_E;
	};
	
	/***
		添加右鍵選單

		注意：手機版不支持。
	*/
	PG.Map.prototype.AddContextMenu = function(cm){
		cm.initialize(this);
	};

	/***
		移除右鍵選單

		注意：手機版不支持。
	*/
	PG.Map.prototype.RemoveContextMenu = function(cm){
		cm.remove(this);
	};
	
	/***
		map輔助類

		地圖緩動效果
	*/
	
	function MapEffect(map){
		this.zuli = 0.85;
		this.map = map;
		this._MD = false;
		this.MD_listener = PG.Event.bind(map,"OnMouseDown",this,this.onMapMouseDown);
		this.MM_listener = PG.Event.bind(map,"mousemove",this,this.onMapMouseMove);
		this.MU_listener = PG.Event.bind(map,"OnMouseUp",this,this.onMapMouseUp);
		this._pre = null;
		this._speed = null;
		this._center = null;
		
		this.isIE = PG.Tool.browserInfo().isIE;
		
	}
	PG.MapEffect = MapEffect;

	/***
		滑鼠按下執行
	*/
	PG.MapEffect.prototype.onMapMouseDown = function(point,button){
		var ms = 16;
		if(this.isIE){
			ms = 10;
		}
		this._test = 1;
		if(this._speedTimer){
			this.clearSpeed();
		}
		this._MD = true;
		var _t = this;
		this._cur = point;
		this._timer = window.setInterval(function(){
				_t._pre = _t._cur;_t._cur = _t._center;
				if(_t._cur&&_t._pre&&_t._pre.x&&_t._cur.x&&_t._pre.y&&_t._cur.y){
					_t._speed = [(_t._cur.x - _t._pre.x)/ms,(_t._cur.y - _t._pre.y)/ms];
				}
			},16);
	};

	/***
		滑鼠移動執行
	*/
	PG.MapEffect.prototype.onMapMouseMove = function(point,button){
		this._center = point;
	};

	/***
		滑鼠放開按下執行

		最小反應為16毫秒,人眼效果為100毫秒
	*/
	PG.MapEffect.prototype.onMapMouseUp = function(point,button){
		var _t = this;
		if(this._speed&&!isNaN(this._speed[0])&&!isNaN(this._speed[1])){
			this._speed = [this._speed[0]*32,this._speed[1]*32];
			this._speedTimer = window.setInterval(function(){
					var mpCenter = _t.map.GetCenter();
					var zm = _t.map.getZoomUnits(_t.map.GetZoomLevel(),true);
					var add = [_t._speed[0]*_t.zuli,_t._speed[1]*_t.zuli];
					var mlng = mpCenter.MercatorLng-add[0]*zm[0];
					var mlat = mpCenter.MercatorLat+add[1]*zm[1];
					
					if((Math.abs(add[0])<3&&Math.abs(add[1])<3)||Math.abs(add[0])>Math.abs(_t._speed[0])||Math.abs(add[1])>Math.abs(_t._speed[1])){
						_t.clearSpeed();
						return;
					}
					var ncp = _t.map.MercatorToLngLat(mlng,mlat,false);
					_t.map.setCenterAtLatLng(ncp);
					_t._speed = [add[0],add[1]];
				},32);
		}
		this.clear();
	};

	/***
		清除滑動效果
	*/
	PG.MapEffect.prototype.clear = function(){
		this._MD = false;
		this._pre = null;
		this._center = null;
		window.clearInterval(this._timer);
		this._timer = null;
	};

	/***
		清除滑動效果時間
	*/
	PG.MapEffect.prototype.clearSpeed = function(){
		window.clearInterval(this._speedTimer);
		this._speedTimer = null;
		this._speed = null;
	};

	/***
		清除滑動效果的所有事件
	*/
	PG.MapEffect.prototype.clearListeners = function(){
		PG.Event.removeListener(this.MD_listener);
		PG.Event.removeListener(this.MM_listener);
		PG.Event.removeListener(this.MU_listener);
		this.MD_listener = null;
		this.MM_listener = null;
		this.MU_listener = null;
	};

	/***
		滑動效果註銷
	*/
	PG.MapEffect.prototype.depose = function(){
		this.clear();
		this.clearSpeed();
		this.map = null;
		this.clearListeners();
	};
	window.PG.MapEffect=PG.MapEffect;
	window.PG.Map=PG.Map;
}
MapNSMap();