/**
	本文件是JS API之中的PG.MapType對像
	
*/
function MapNSMapType()
{
	/**
		此類用於定義地圖類型(參考PG.MapType.prototype.init)

		layers:  圖塊層數組([PG.TileLayer])
		name:	 圖塊層名稱(地圖,衛星,混合地圖)
		config:  圖塊層配置信息,格式為{shortName:'',tileSize:0,MinResolution:0,maxResolution:0}
	*/
	function MapType(layers,name,config)
	{
		this._layers = layers;
		this._name = name;
		this.config = config?config:{};
		this._sName = this.config.shortName?this.config.ShortName:this._name;
		this._tileSize = this.config.tileSize?this.config.TileSize:256;
		this._minResolution = Number.MAX_VALUE;
		this._maxResolution = Number.MIN_VALUE;
		for(var i=0;i<this._layers.length;i++){
			if(this._minResolution<this._layers[i]._minResolution){
				this._minResolution = this._layers[i]._minResolution;
			}
			if(this._maxResolution>this._layers[i]._maxResolution){
				this._maxResolution = this._layers[i]._maxResolution;
			}
		}
		if(this.config.minResolution){
			this._minResolution = this.config.MinResolution;
		}
		if(this.config.maxResolution){
			this._maxResolution = this.config.MaxResolution;
		}
	}
	PG.MapType = MapType;

	/**
		返回此地圖類型名稱		
	*/
	PG.MapType.prototype.GetName = function(isShort){
		return isShort?this._sName:this._name;
	};

	/**
		返回此地圖類型的地圖圖塊大小
		這些圖塊的結構假定為二次的.所有圖塊層的圖塊大小相同.
	*/
	PG.MapType.prototype.GetTileSize = function(){
		return this._tileSize;
	};

	/**
		返回圖塊層數組.
	*/
	PG.MapType.prototype.GetTileLayers = function(){
		return this._layers;
	};

	/**
		返回定義此地圖類型的最低縮放級別.
	*/
	PG.MapType.prototype.GetMinimumResolution = function(){
		return this._minResolution;
	};

	/**
		返回定義此地圖類型的最低縮放級別.
	*/
	PG.MapType.prototype.GetMaximumResolution = function(){
		return this._maxResolution;
	};
	
	/**
		根據x,y,z計算WMS經緯度範圍/per tile, 
		BBox
	*/
	PG.MapType.getLngLatSpan = function(x,y,z){
		//圖片要按照256分割的
		x=parseInt(x);	y=parseInt(y);	z=parseInt(z);
		var size = 256;
		var maxResolution = 156543.0339;	
		var units = maxResolution / Math.pow(2, z);			
		var su = size*units;
		var mr = maxResolution*128;
		var hor1 = x*su - mr;
		var ver1 = mr-(y+1)*su;
		var hor2 = hor1 + su;
		var ver2 = ver1 + su;
		//var mecato = [Math.abs(hor1),Math.abs(ver1),Math.abs(hor2),Math.abs(ver2)];
		var mecato = [hor1,ver1,hor2,ver2];
		//墨卡托轉經緯度
		var m1 = PG.Tool.inverseMercator(mecato[0],mecato[1]);
		var m2 = PG.Tool.inverseMercator(mecato[2],mecato[3]);	
		var m3 = m1.concat(m2);			
		return m3;
	};
	
	/**
		根據x,y,z計算WMS的取圖路徑
	*/
	PG.MapType.wms = function(x,y,z){
		var u1 = "http://www2.demis.nl/worldmap/wms.asp?Service=WMS&Version=1.1.0";
		var u2 = "&Request=GetMap&BBox=" + PG.MapType.getLngLatSpan(x,y,z);
		var u3 = "&SRS=EPSG:4326&Width=256&Height=256";
		var u4 = "&Layers=Countries,Borders,Coastlines&Format=image/png";
		return u1 + u2 + u3 + u4;
	};

	/*
	 * Google取圖函數
	 */
	PG.MapType.google = function(x,y,z){
		var google_url = "http://mt1.google.com/vt/lyrs=m@174000000&hl=zh-TW&gl=tw&src=app&s=Ga";		
		return google_url+"&x="+x+"&y="+y+"&z="+z;
	};
	
	/**
		地圖類型初始化函數--checkin point
	*/
	PG.MapType.init = function(Config4PG){
		var option = {};
		option.isPng = false;
		option.minResolution = 1;
		option.minResolution = 14;

		//二維地圖瓦片層(預設地圖)
		var normalLayer = new PG.TileLayer(option);
		//預設地圖取圖函數定義在PG.Map.prototype.getMapImagesUrl (PG.Map.js)
		//normalLayer.SetGetTileUrl(PG.Map.prototype.getMapImagesUrl);
		if(!window.PG.isNull(Config4PG["GetNLFunction"])){
			if(typeof Config4PG["GetNLFunction"] == 'function'){
				normalLayer.SetGetTileUrl(Config4PG["GetNLFunction"]);
			}else{ 
			if(typeof Config4PG["GetNLFunction"] == 'string'){
				var _func=eval(Config4PG["GetNLFunction"]);
				normalLayer.SetGetTileUrl(_func);
			}}	
		}else{
			PG.Map.prototype.SetMapImagesFunc(window.PG.NORMAL_MAPimgURLs[0],normalLayer,function(map){
				//while(normalLayer.version==0){PG.Map.sleep(1000);};
				//PG.NORMAL_MAPimgURLs定義在config裡
				//map.Refresh();
				//console.log('normalLayer.getTileUrl值是：%s',normalLayer.getTileUrl);
				//console.log('normalLayer.Version值是：%s',normalLayer.Version);	
				//console.log('normalLayer.LayerName值是：%s',normalLayer.LayerName);				
				//pilotgaea 二維地圖類型(預設地圖)				
			},true);
		}
		normalLayer.getImgUrl = function(){return window.PG.NORMAL_MAPimgURLs[0];};
		normalLayer.getExtName = function(){return ".png";};
		window.PG.NORMAL_MAP = new PG.MapType([normalLayer],"Pilotgaea");
		window.PG.NORMAL_MAP.getTileSize = function(){return 256;};
		//wms
			var wmsLayer = new PG.TileLayer(option);
			wmsLayer.SetGetTileUrl(PG.MapType.wms);
			wmsLayer.getImgUrl = function(){return ''};
			wmsLayer.getExtName = function(){return ".png";};
							
			//wms地圖類型
			window.PG.WMS_MAP = new PG.MapType([wmsLayer],"WMS");
			window.PG.WMS_MAP.getTileSize = function(){return 256;};
	
			//google  
			option.isPng = false; 
			var googleLayer = new PG.TileLayer(option); 
			//SetGetTileUrl 設定取圖函數
			googleLayer.SetGetTileUrl(PG.MapType.google);
			//這個只是返回url
			googleLayer.getImgUrl = function(){return 'http://mt1.google.com/vt/lyrs=m@174000000&hl=zh-TW&gl=tw&src=app&s=Ga';};
			googleLayer.getExtName = function(){return ".jpg";};
			window.PG.Google_MAP = new PG.MapType([googleLayer],"Google");  
			window.PG.Google_MAP.getTileSize = function(){ return 256;}; 			
	
			//預設所有地圖類型 array
			window.PG.DEFAULT_MAP_TYPES = [window.PG.NORMAL_MAP,window.PG.WMS_MAP,window.PG.Google_MAP];
		
	};
	
	window.PG.MapType=PG.MapType;
	//設定檔
	window.Config4PG = window.Config4PG||{};
	PG.MapType.init(window.Config4PG);
}
MapNSMapType();