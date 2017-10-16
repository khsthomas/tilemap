(function(){
	this._getBaseUrl = function() {
	    var url= location.protocol + "//" + location.hostname +
	      (location.port && ":" + location.port) + "/";
	      //alert(url);//
	    return url;
	}
	this.ImgPath=this._getBaseUrl()+"img/maps/";
		this.ZoomLevels=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
		this.MaxZoomLevel=24;
		
		this.NORMAL_MAPimgURLs=["http://192.168.123.22/Server/TM?LN=Asia"];
		this.MapVersionServer=this._getBaseUrl()+"GetVer.php";
		//window.PG = window.PG||{};
		this.LayerVersion=null;
		//使用前一版本的取圖函數
		this.GetNLFunction='_tmpFunc=PG.Map.prototype.getMapImagesUrl';
		
		this.SMC_TipText={15:"街道",11:"城市",6:"省",2:"國"};
		this.SMC_TipSize=[51,16,0,-8,6,2]; 
		this.LogoHtml="test";
		
		
	//window.PG = window.PG||{};
	window.Config4PG=this;
})();
