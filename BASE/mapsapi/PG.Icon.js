/**
	本文件是JS API之中的PG.Icon,PG.DivIcon,PG.IconShadow類
	
*/
function NSIcon()
{
	/**
		Icon主要用來設置疊加物Marker的圖標

		url：表示圖標所關聯的圖片URL路徑.
		size：表示圖標的大小,默認使用當前提供的圖標圖片的大小,不過在某些情況下（用戶使用自己的圖標）可能會出現問題,所以如果傳第一個參數則此參數必須傳遞,系統集成圖標的大小為[23, 21].
		anchor：表示圖標的錨點相對於圖標左上角的位置,默認是圖標底邊中心位置,系統集成圖標的錨點位置為[4, 21]

	*/
	function Icon(url,size,anchor,doc)
	{
		var doc=doc?doc:document;
		this.img =doc.createElement("img");
//		this.img.style.position="absolute";
//		初始化為空
		this.iconUrl="";
		this.size=null;
		this.anchor=null;
		
		if(url)
		{
			this.SetSrc(url);
		}
		this.SetSize(size);
		this.SetAnchor(anchor);
		
		this.containerDiv=doc.createElement("div");
		PG.Tool.setCssText(this.containerDiv,'position: relative; left: 0px; top: 0px');
		this.containerDiv.appendChild(this.img);	
		//截圖用到
		if(!Icon.abs_src){
			Icon.abs_src = document.createElement("img");
		}
	}
	PG.Icon = Icon;

	/**
		獲取圖標的大小,如果指定了圖標的大小則返回該大小,否則返回圖標圖片的實際大小.
		當為指定圖標大小時,如果調用的時候該圖標還沒有下載完成的話,則可能返回[0,0],
		而這可能會引發其他一些問題,所以強烈建議在自定義圖標的時候指定圖標的大小和錨點位置
	*/
	PG.Icon.prototype.GetSize=function()
	{
		return this.size?this.size:new PG.Size(this.img.offsetWidth,this.img.offsetHeight);
	};

	/**
		設置圖標的大小
	*/
	PG.Icon.prototype.SetSize=function(size)
	{
		this.size=size;
		if(size)
		{
			PG.Tool.SetSize(this.img,[size.width,size.height]);
		}
		else
		{
			this.img.style.width="auto";
			this.img.style.height="auto";
		}	
	};

	/**
		獲取圖標錨點在圖片上的位置,即相對於圖片左上角的像素距離
	*/
	PG.Icon.prototype.GetAnchor=function()
	{	
		if(this.anchor){return this.anchor;}
		var size=this.GetSize();
		return new PG.Point(size.width/2,size.height);
	};

	/**
		設置圖標錨點在圖片上的位置,即相對於圖片左上角的像素距離
		anchor:PG.Point
	*/
	PG.Icon.prototype.SetAnchor=function(anchor)
	{
		this.anchor=anchor;
	};

	/**
		設置圖片地址
	*/
	PG.Icon.prototype.SetImageUrl = function(url,size,anchor)
	{
		this.SetSrc(url);
		this.size=size?size:null;
		this.anchor=anchor?anchor:null;
		this.reDraw();
	};

	/**
		設置圖標使用的圖片鏈接URL
	*/
	PG.Icon.prototype.SetSrc= function(url)
	{
		this.iconUrl=url;
		PG.Icon.setPngSrc(this.img,this.iconUrl);
	};

	/**
		獲取圖標使用的圖片URL
	*/
	PG.Icon.prototype.GetSrc = function()
	{
		return this.iconUrl;
	};
	
	/**
		獲取圖標使用的圖片URL
	*/
	PG.Icon.prototype.getAbsSrc = function(){
		Icon.abs_src.src = this.iconUrl;
		return Icon.abs_src.src;
	};

		
	/**
		設置圖標寬度
	*/
	PG.Icon.prototype.SetWidth = function( w )
	{
		this.img.style.width = PG.Tool.getUserInput( w );
	};

	/**
		設置圖標高度
	*/
	PG.Icon.prototype.SetHeight = function( h )
	{
		this.img.style.height = PG.Tool.getUserInput( h );
	};

	/**
		設置圖標標題
	*/
	PG.Icon.prototype.SetAlt = function( label )
	{
		this.img.title = label;
	};

	/**
		複製圖標
	*/
	PG.Icon.prototype.Copy=function()
	{
		var size=this.GetSize();
		if(!(size.width>0 && size.height>0)){size=null;}
		var anchor=this.GetAnchor();
		if(size==null && anchor.x==0 && anchor.y==0){anchor=null;}
		var newIcon = new PG.Icon(this.iconUrl,size,anchor);
//		拷貝投影的數據
		if(this.imgShadow==null){
			newIcon.RemoveShadow();
		}else{
			newIcon.imgShadow.clone(this.imgShadow,newIcon.imgShadow);
		}
		return newIcon;
	};

	/**
		返回容器
	*/
	PG.Icon.prototype.GetObject = function()
	{
		this.beUsed=true;
		if( this.GetSrc() == "" )
		{
			this.SetSrc(window.PG._icon_img);
			var sz = window.PG._icon_imgSize;
			this.SetSize(sz?new PG.Size(sz[0],sz[1]):new PG.Size(20,34));
			var an = window.PG._icon_imgAnchor;
			this.SetAnchor(an?new PG.Point(an[0],an[1]):new PG.Point(9,34));
		}		
		return this.containerDiv;
	};

	/**
		返回圖標圖片對像
	*/
	PG.Icon.prototype.GetImgObject = function(){
		return this.img;
	};

	/**
		重新設置圖標
	*/
	PG.Icon.prototype.reDraw = function()
	{
		this.SetSrc(this.iconUrl);
		this.SetSize(this.size);
		this.SetAnchor(this.anchor);
		PG.Event.trigger(this,"resize",[]);
	};

	/**
		成一個圖片的陰影
	*/
	PG.Icon.prototype.SetShadow = function()
	{
		this.imgShadow=new PG.IconShadow();
		this.imgShadow.bindShadow(this);
	};

	/**
		設置陰影圖片錨點在陰影圖片上的位置,即相對於陰影圖標左上角的像素距離
		nchor:PG.Point
	*/
	PG.Icon.prototype.SetShadowAnchor = function(anchor){
		if(this.imgShadow){
			this.imgShadow.SetAnchor(anchor);
		}
	};

	/**
		置陰影圖片的大小
	*/
	PG.Icon.prototype.SetShadowSize = function(arySize){
		if(this.imgShadow){
			this.imgShadow.SetSize(arySize);
		}
	};

	/**
		設置陰影圖片的鏈接URL
	*/
	PG.Icon.prototype.SetShadowImg = function(imgUrl){
		if(this.imgShadow){
			this.imgShadow.SetShadowImg(imgUrl);
		}
	};

	/**
		重新設置圖標陰影 
	*/
	PG.Icon.prototype.reDrawShadow = function(){
		if(this.imgShadow){
			this.imgShadow.reDraw();
		}
	};

	/**
		移除圖標的陰影
	*/
	PG.Icon.prototype.RemoveShadow = function(){
		if(this.imgShadow){
			this.imgShadow.depose();
			this.imgShadow=null;
		}
	};
	
	/**
		設置濾鏡或者非濾鏡
	*/
	PG.Icon.setPngSrc=function(obj,imgsrc){
	//此處無法判斷是png,因為有可能的url是這樣的:http://somedomain.com/動態img?dwadwadwda	
		if(PG.Tool.browserInfo().isIE6){
			obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgsrc+"',sizingMethod='crop')";
			obj.style.overflow="hidden";
			obj.src=window.PG._map_maskBackgroundURL;
		}else{
			obj.src=imgsrc;
		}
	};

	/**
		生成marker的icon
		偏移相對於icon,不由PG.PointOverly決定
	*/
	function IconShadow(){
		this.iconShadow=document.createElement("img");
		PG.Tool.setCssText(this.iconShadow,'cursor:default;position: absolute; left: 0px; top: 0px;z-index:-1');
		var p = window.PG._icon_imgShadow;
		this.SetShadowImg(p);
		var s = window.PG._icon_imgShadowSize;
		this.SetSize(new PG.Size(s[0],s[1]));
		this.bindIcon=null;
		this.iconShadow.isCancelBubble=true;
	}
	PG.IconShadow = IconShadow;

	/**
		將陰影綁定到icon
		icon:PG.Icon
	*/
	PG.IconShadow.prototype.bindShadow = function(icon)
	{
		this.bindIcon=icon;
		this.bindIcon.getObject().appendChild(this.iconShadow);
		this.listeners=[PG.Event.bind(this.bindIcon,"resize",this,this.reDraw)];
		this.SetAnchor(window.PG._icon_imgShadowAnchor);
	};

	/**
		設置陰影圖片地址
	*/
	PG.IconShadow.prototype.SetShadowImg = function(urlStr){
		this.iconShadowUrl=urlStr;
		PG.Icon.setPngSrc(this.iconShadow,this.iconShadowUrl);
	};

	/**
		重新設置陰影
	*/
	PG.IconShadow.prototype.reDraw = function()
	{
		this.SetSize(this.shadowSize);
		this.SetAnchor(this.shadowAnchor);
	};

	/**
		設置陰影大小
	*/
	PG.IconShadow.prototype.SetSize=function(arySize){
		this.shadowSize=arySize;
		PG.Tool.SetSize(this.iconShadow,[arySize.width,arySize.height]);
	};

	/**
		設置圖標陰影的瞄點 
	*/
	PG.IconShadow.prototype.SetAnchor=function(anchor)
	{
		if(PG.Tool.isArray(anchor)){
			anchor = new PG.Point(anchor[0],anchor[1]);
		}
		this.shadowAnchor=anchor;
		if(this.bindIcon){
			var iconAnchor=this.bindIcon.GetAnchor();
			this.iconShadow.style.left=-this.shadowAnchor.x+iconAnchor.x+"px";
			this.iconShadow.style.top=-this.shadowAnchor.y+iconAnchor.y+"px";
		}
	};

	/**
		估計用不到	
	*/
	PG.IconShadow.prototype.depose = function()
	{
		this.bindIcon=null;
		if(this.iconShadow.parentNode){
			this.iconShadow.parentNode.removeChild(this.iconShadow);
		}
		var listener;
		while(listener=this.listeners.pop())
		{
			PG.Event.removeListener(listener);
		}
	};

	/**
		克隆陰影
	*/
	PG.IconShadow.prototype.clone = function(oldShadow,newShadow){
		newShadow.SetShadowImg(oldShadow.iconShadowUrl);
		newShadow.SetSize(oldShadow.shadowSize);
		newShadow.SetAnchor(oldShadow.shadowAnchor);
	};

	
	/**
		lee add 可以把div作為一個icon,這個div可以由代碼生成,例如vml,canvas,svg...
		
		此對像在地址編輯器,面編輯中被使用到
	*/
	function DivIcon(element,size,anchor,doc)
	{
		var doc=doc?doc:document;
		this.img =doc.createElement("div");
		this.img.style.position="relative";
		if(element)
		{
			this.SetDivObject(element);
		}
		this.SetSize(size);
		this.SetAnchor(anchor);
	}
	PG.DivIcon = DivIcon;

	/**
		得到圖標大小
	*/
	PG.DivIcon.prototype.GetSize=function()
	{
		return this.size?this.size:new PG.Size(this.img.offsetWidth,this.img.offsetHeight);
	};

	/**
		設置圖標大小
	*/
	PG.DivIcon.prototype.SetSize=function(size)
	{
		this.size=size;
		if(size)
		{
			PG.Tool.SetSize(this.img,[size.width,size.height]);
		}
		else
		{
			this.img.style.width="auto";
			this.img.style.height="auto";
		}	
	};

	/**
		得到圖標瞄點位置
	*/
	PG.DivIcon.prototype.GetAnchor=function()
	{
		if(this.anchor){return this.anchor;}
		var size=this.GetSize();
		return new PG.Point(size.wdith/2,size.height);
	};

	/**
		設置圖標瞄點位置
	*/
	PG.DivIcon.prototype.SetAnchor=function(anchor)
	{
		this.anchor=anchor;
	};

	/**
		重新設置容器對像
	*/
	PG.DivIcon.prototype.setResetObject = function(obj)
	{
		this.SetDivObject(obj);
		this.size=null;
		this.anchor=null;
	};

	/**
		設置容器對像
	*/
	PG.DivIcon.prototype.SetDivObject= function(obj)
	{
		this.divElement = obj;
		this.img.appendChild(obj);
	};

	/**
		返回容器對像
	*/
	PG.DivIcon.prototype.GetDivObject = function()
	{
		return this.divElement;
	};

	/**
		設置圖標寬度
	*/
	PG.DivIcon.prototype.SetWidth = function( w )
	{
		this.img.style.width = PG.Tool.getUserInput( w );
	};

	/**
		設置圖標高度
	*/
	PG.DivIcon.prototype.SetHeight = function( h )
	{
		this.img.style.height = PG.Tool.getUserInput( h );
	};

	/**
		設置圖標描述
	*/
	PG.DivIcon.prototype.SetAlt = function( label )
	{
		this.img.label = label;
	};

	/**
		複製圖標
	*/
	PG.DivIcon.prototype.Copy=function()
	{
		var size=this.GetSize();
		if(!(size.width>0 && size.height>0)){size=null;}
		var anchor=this.GetAnchor();
		if(size==null && anchor.x==0 && anchor.y==0){anchor=null;}
		return new PG.DivIcon(this.divElement,size,anchor);
	};

	/**
		返回圖標對像
	*/
	PG.DivIcon.prototype.GetObject = function()
	{
		this.beUsed=true;
		return this.img;
	};

	/**
		添加此方法主要是為了兼容PG.Icon的removeShadow
		如果不添加此方法,由於PG.Marker的getIcon方法可能會返回PG.DivIcon
		而PG.DivIcon沒有removeShadow,則可能會報錯
		例如在編輯面的時候就會報錯

		----徐金評
	*/
	PG.DivIcon.prototype.RemoveShadow = function(){};
		
	window.PG.Icon=PG.Icon;
	window.PG.DivIcon=PG.DivIcon;
	window.PG.IconShadow=PG.IconShadow;
}
NSIcon();