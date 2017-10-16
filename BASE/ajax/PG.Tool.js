/**
	按照分層的思想,這個類應該屬於最底層
*/
function NSTool()
{
	function Tool()
	{
	}
	PG.Tool = Tool;

	/**
		將對像obj中繼承cla
	*/
	PG.Tool.inherit=function(obj,cla)
	{
		var item;
		for(item in cla){obj[item]=cla[item];}
	};

	/**
		從數組對像array中刪除item項
	*/
	PG.Tool.deleteFromArray=function(array,item)
	{
		for(var i=array.length-1;i>=0;i--)
		{
			if(array[i]==item)
			{
				array.splice(i,1);
			}
		}
	};

	/**
		求對像obj在頁面中的位置(到左上角的坐標)
	*/
	PG.Tool.getPageOffset=function(obj)
	{
		var point=[0,0];
		var a=obj;
		while(a && a.offsetParent)
		{
			point[0]+=a.offsetLeft;
			point[1]+=a.offsetTop;
			a=a.offsetParent;
		}
		return point;
	};

	/**
		有更好的改進方法---原註釋
		判斷一個對象是否已經在document中----徐金評

		這個方法似乎有漏洞

		例如如下測試代碼:
		var c=document.createElement("div");
		var s=document.createElement("div");
		c.appendChild(s);
		var isInDocument=PG.Tool.isInDocument(s);
		alert('isInDocument = '+isInDocument);

		isInDocument為真,但對像c和對像s並沒有添加到document中


	*/
	PG.Tool.isInDocument=function(obj)
	{
		//return obj.parentNode && obj.parentNode.nodeType!=11;
		
		var obj_p=obj.parentNode;
		while(obj_p!=null){
			if(obj_p.nodeName==='BODY'){return true;}
			obj_p=obj_p.parentNode;
		}
		return false;
	};

	/**
		設置HTML  div 對像
		參數position設定對象是絕對還是相對定位(0--不設定,2--relative,其他數字都為absolute)
		參數point設定對象的寬度和高度,格式為[width,height]
		參數zIndex設定對象的層
	*/
	PG.Tool.createDiv=function(position,point,zIndex)
	{
		var div=document.createElement("div");
		if(position>0){div.style.position=(position==2)?"relative":"absolute";}
		if(point){PG.Tool.setPosition(div,point);}
		if(zIndex){PG.Tool.setZIndex(div,zIndex);}
		return div;
	};

	/**
		設置HTML對像樣式的left和top
	*/
	PG.Tool.setPosition=function(div,position)
	{
		div.style.left=PG.Tool.getUserInput(position[0]);
		div.style.top=PG.Tool.getUserInput(position[1]);
	};

	/**
		設置HTML object 樣式的width和height
	*/
	PG.Tool.SetSize=function(div,size)
	{
		div.style.width=PG.Tool.getUserInput(size[0]);
		div.style.height=PG.Tool.getUserInput(size[1]);
	};

	/**
		設置HTML對像樣式的zIndex
	*/
	PG.Tool.setZIndex=function(div,zIndex)
	{
		div.style.zIndex=zIndex;
	};
	
	/**
		求事件e在container object中的觸發位置
	*/
	PG.Tool.getEventPosition=function(e,container)
	{
//lee		svg在safari和chrome下,path節點的offsetParent為null(safari和chrome都有屬性offsetX和pageX)
		if(typeof e.offsetX!="undefined"&&typeof e.pageX=="undefined")
		{
			var src=e.target||e.srcElement;
			var offset=[e.offsetX,e.offsetY];
			while(src&&src!=container)
			{
				var zoom=src.style.zoom;
				if(zoom)
				{
					offset[0]*=zoom;
					offset[1]*=zoom;
				}
				if(!(src.clientWidth==0 && src.clientHeight==0 && src.offsetParent && src.offsetParent.nodeName=="TD"))
				{
					offset[0]+=src.offsetLeft;
					offset[1]+=src.offsetTop;
				}
				src=src.offsetParent;
			}
			return offset;
		}
		else if(typeof e.pageX!="undefined")
		{
			var offset=PG.Tool.getPageOffset(container);
			//return [e.pageX-offset[0],e.pageY-offset[1]];
			var x,y;
			if(e.touches){x=e.touches[0].pageX;y=e.touches[0].pageY;}else{x=e.pageX;y=e.pageY;}
			return [x-offset[0],y-offset[1]];
		}else{return [0,0];}
			
	};

	/**
		用於處理用戶輸入數字、像素或百分比
	*/
	PG.Tool.getUserInput = function( values ){
		if( typeof values == "number" )
		{
			return values+"px";
		}
		else if(typeof values == "string" )
		{
			var patrn0 = new RegExp("\\s","g");//去空格
			var patrn1 = new RegExp("^\\d+(px|%)+$","i");//後面是%或是px
			var v = values.replace( patrn0 , "" );//去除所有的空格
			if( patrn1.exec( v ) ){	return v;}
			var patrn2 = new RegExp("^\\d+$");//一個數字字符串
			if( patrn2.exec( v ) ){	return v+"px";}
			return "0px";
		}
	};

	/**
		設置HTML對像樣式的cursor
	*/
	PG.Tool.setCursorStyle=function(obj,style)
	{
		if(style.indexOf(",")>0&&!(style.toLowerCase().indexOf("url(")>-1))
		{
			var styles=style.split(",");
			for(var i=0;i<styles.length;i++)
			{
				if(PG.Tool.setCursorStyle(obj,styles[i])){return true;}
			}
			return false;
		}
		try
		{
			//使用圖檔的情況下
			if(style.toLowerCase().indexOf("url(")>-1){
				style=style;
			}
			else if(style.toLowerCase().indexOf(".cur")>0)
			{
				style="url("+style+"),auto";
			}
			style=style.toLowerCase();
			//IE的用hand
			if(style=="hand" && !document.all)
			{
				style="pointer";
			}
			obj.style.cursor = style;
			return true;
		}
		catch(e){return false;}
	};

	/**
		返回false
	*/
    PG.Tool.falseFunction=function()
    {
    	return false;
    };

	/**
		當我們要拽動某個控件(obj)的時候,瀏覽器會以為我們要選擇網頁內容,
		然後出現一大片難看的選擇區域,此函數的功能就是為了避免這種情況
	*/	
    PG.Tool.setUnSelectable=function(obj)
	{
		if(PG.BrowserInfo.isIE())
		{
			obj.unselectable="on";
			PG.Event.addListener(obj,"selectstart",PG.Tool.falseFunction);
		}
		else
		{
			obj.style.MozUserSelect="text";
			obj.style.MozUserSelect="none";
			obj.style.WebkitUserSelect="none";
		}		
	};

	/**
		設置HTML對像樣式的opacity
		opacity為標準寫法,以小數點形式,IE下必須乘以100
		
		主要瀏覽器的設置方法如下:
		 -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=30)"; (IE8)
	     filter:alpha(opacity=30);  (IE5、IE5.5、IE6、IE7)
	     opacity: .3;  (Opera9.0+、Firefox1.5+、Safari、Chrome)
	*/
    PG.Tool.setOpacity=function(obj,opacity)
	{
		obj.style.filter="progid:DXImageTransform.Microsoft.Alpha(opacity="+parseInt(opacity*100)+")";
		obj.style.MozOpacity =opacity;
		obj.style.opacity=opacity;
	};
	
	/**
		判斷觸發事件的鼠標鍵碼----左鍵 1,右鍵 2
	*/
	PG.Tool.getEventButton=function(e)
	{
		return PG.BrowserInfo.isIE()?e.button:(e.button==2?2:1);
	};

	/**
		計算兩個經緯度之間的距離(以米做單位)

		以正球計算,地球的平均半徑6371.004千米,赤道半徑6378.140千米,極地6356.755千米
	*/
	PG.Tool.getPointsDistance=function(a,b,radius)
	{
		var R = radius?radius:6371.004;
		var B = (b.x-a.x)*Math.PI/100000/180;
		var c =Math.PI/2-a.y*Math.PI/100000/180;
		var a =Math.PI/2-b.y*Math.PI/100000/180;
		var b =Math.cos(a)*Math.cos(c)+Math.sin(a)*Math.sin(c)*Math.cos(B);
		var L = R*Math.acos(b)*1000;
		return L;//返回以米做單位的距離
	};

	/**
		w84轉為墨卡托坐標(經緯度轉墨卡托)
		WGS84是地理坐標的一種,地理坐標本身有很多種,web墨卡托是投影坐標
	*/
	PG.Tool.forwardMercator = function(lon, lat) {
		lon = parseFloat(lon);
		lat = parseFloat(lat);
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;        
        return [x,y];
    };
	
	/**
		將墨卡托坐標轉為w84(墨卡托轉經緯度)
	*/
	PG.Tool.inverseMercator = function(x, y) {
        var lon = (x / 20037508.34) * 180;
        var lat = (y / 20037508.34) * 180;
        //緯度
        lat = 180/Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
        return [lon, lat];
    };
	
	/**
		加載微軟向量圖形繪製VML命名空間
	*/
	PG.Tool.loadVmlNamespace=function()
	{
		if(document.createElement("v:shape").tagUrn){return;}
		if(!document.namespaces.v){document.namespaces.add("v","schemas-microsoft-com:vml");}
		var style=document.createElement('style');
		style.type="text/css";
		document.body.insertBefore(style,document.body.firstChild);
		var styleSheets=document.styleSheets;
		for(var i=0;i<styleSheets.length;i++)
		{
			if(styleSheets[i].owningElement==style){styleSheets[i].addRule('v\\:*','Behavior:url(#default#VML)')};
		}
	};

	/**
		得到容器的寬度和高度信息
	*/
	PG.Tool.GetSize=function(container)
	{
		var viewSize=[container.offsetWidth,container.offsetHeight];
		if(container==document.body && !document.all){viewSize[1]=container.clientHeight;}
		if(!viewSize[0])
		{
			viewSize[0]=container.clientWidth;
		}
		if(!viewSize[0])
		{
			viewSize[0]=parseInt(container.style.width);
		}
		if(!viewSize[1])
		{
			viewSize[1]=container.clientHeight;
		}
		if(!viewSize[1])
		{
			viewSize[1]=parseInt(container.style.height);
		}
		if(!viewSize[0] || !viewSize[1])
		{
			var obj=container.parentElement;
			while(obj)
			{
				if(!viewSize[0] && obj.offsetWidth)
				{
					viewSize[0]=obj.offsetWidth;
				}
				if(!viewSize[1] && obj.offsetHeight)
				{
					viewSize[1]=obj.offsetHeight;
				}
				if(viewSize[0] && viewSize[1])
				{
					break;
				}
				obj=obj.parentElement;
			}
		}
		return viewSize;
	};

	/**
		判斷png格式圖片
	*/
	PG.Tool.isPng=function(a)
	{
		if(!a){return false};
		var upper=a.toUpperCase();
		if(upper.indexOf(".PNG")!=-1)
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	/**
		lee add
		為對像obj添加png格式的背景圖片
		eg:PG.Tool.setPngSrc(obj,"a.png",[obj.offsetHeight,obj.offsetWidth],true,[12,-18],"repeat-y")
	*/
	PG.Tool.setPngSrc=function(obj,imgsrc,size,isbg,bgPos,repeat){
		if(PG.Tool.browserInfo().isIE6){
			obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgsrc+"',sizingMethod='crop')";
			obj.style.overflow="hidden";
			if(!isbg){
				obj.src=window.PG._map_maskBackgroundURL;
			}
		}else{
			if(isbg){
				this.zoomIn.style.background = 'url('+url+')';
				if(bgPos){
					this.zoomIn.style.backgroundPosition = bgPos[0] + "px "+bgPos[1]+"px";
				}
				if(repeat){
					this.zoomIn.style.backgroundRepeat = repeat;
				}
			}else{
				obj.src=imgsrc;
			}
		}
		if(size){
			PG.Tool.SetSize(obj,size);
		}
	};

	/**
		lee add
		為對像obj添加樣式cssText
	*/
	PG.Tool.setCssText=function(obj,cssText){
		obj.style.cssText=cssText;				//ie
		obj.setAttribute("style",cssText);		//ff
	};

	/**
		lee add
		往樣式文件添加樣式
		參數className為名稱
		參數rule為規則

		使用方法:
		addRule("#sug td", "font:14px verdana"); 		
		addRule(".mo", "background-color:#36c;color:#fff");
	*/
	PG.Tool.addRule=function(className, rule) {
        var sheet = document.styleSheets[0];
        if (PG.Tool.browserInfo().isIE) {
            sheet.addRule(className, rule);
        } else {
            var oneCssRule = className + "{" + rule + "}";
            sheet.insertRule(oneCssRule, sheet.cssRules.length);
        }
    };

	/**
		lee add
		得到瀏覽器信息
	*/
	PG.Tool.browserInfo=function(){
		var isIE = navigator.userAgent.indexOf("MSIE") != -1 && !window.opera;
	    var isWebKit = (navigator.userAgent.indexOf("AppleWebKit/") > -1);
	    var isGecko = (navigator.userAgent.indexOf("Gecko") > -1) && (navigator.userAgent.indexOf("KHTML") == -1);
		var isOpera = navigator.userAgent.indexOf("Opera") > -1;
		var isChrome = navigator.userAgent.indexOf("Chrome") > -1 ;
		
		var isIE6;
		var browser=navigator.appName;
		var b_version=navigator.appVersion;
		var version=b_version.split(";");
		var trim_Version="";
		if(version[1]){
			trim_Version=version[1].replace(new RegExp("[ ]","g"),"");
		}
		if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0")
		{
			isIE6 = true;
		}else
		{
			isIE6 = false;
		}		
		var isMwk = PG.BrowserInfo.isMSF()||PG.BrowserInfo.isCL();
		return {isIE:isIE,isWebKit:isWebKit,isGecko:isGecko,isIE6:isIE6,isOpera:isOpera,isChrome:isChrome,isMwk:isMwk};
	};

	/**		
		判斷是否支持zoom,來進行是否zoom縮放,IE8不支持zoom,暫時只好以IE7運行
	*/
	PG.Tool.isZoom = function(){
		var binfo = PG.Tool.browserInfo();
		return binfo.isIE||binfo.isWebKit;
	};

	/**		
		判斷是否需要img zoom
		是否為mobil
	*/
	PG.Tool.isImgZoom = function(){
		var binfo = PG.Tool.browserInfo();
		return binfo.isGecko||binfo.isWebKit;
	};	

	/**
		去左空格
	*/
	PG.Tool.ltrim = function(s){
		var rg = new RegExp("^\\s*");
	  	return s.replace(rg,"");
	};

	/**
		去右空格
	*/
	PG.Tool.rtrim = function(s){
		var rg = new RegExp("\\s*$");
	  	return s.replace(rg,"");
	};

	/**
		去左右空格
	*/
	PG.Tool.trim = function(s){
		if(typeof(s)!="string")return s;
	  	return PG.Tool.rtrim(PG.Tool.ltrim(s));
	};

	/**
		判斷對象是否為數組
	*/
	PG.Tool.isArray = function(obj){
		return Object.prototype.toString.apply(obj) === '[object Array]';
	};
	
	window.PG.Tool=PG.Tool;
}
NSTool();

/**
 *加密模組
 */ 
function NSCrypto(){
	function Crypto(){}
	PG.Crypto = Crypto;
	//key
	PG.Crypto.Key="PGEncrypto";
	//JS DES加密函數
	PG.Crypto.Encrypt = function(message, key) {
		if((typeof(key) == 'undefined' || key == null)){key=this.Key;}
	    var ciphertext = this.stringToHex(this.des(key, message, 1, 0));
	    return ciphertext;
	}
	
	//JS DES解密函數
	PG.Crypto.Decrypt = function( message, key) {
		if((typeof(key) == 'undefined' || key == null)){key=this.Key;}
	    var plaintext = this.des(key, this.HexTostring(message), 0, 0);
	    return plaintext;
	}
	
	//加解密主函數
	PG.Crypto.des = function(key, message, encrypt, mode, iv) {
	    var spfunction1 = new Array(0x1010400, 0, 0x10000, 0x1010404, 0x1010004, 0x10404, 0x4, 0x10000, 0x400, 0x1010400, 0x1010404, 0x400, 0x1000404, 0x1010004, 0x1000000, 0x4, 0x404, 0x1000400, 0x1000400, 0x10400, 0x10400, 0x1010000, 0x1010000, 0x1000404, 0x10004, 0x1000004, 0x1000004, 0x10004, 0, 0x404, 0x10404, 0x1000000, 0x10000, 0x1010404, 0x4, 0x1010000, 0x1010400, 0x1000000, 0x1000000, 0x400, 0x1010004, 0x10000, 0x10400, 0x1000004, 0x400, 0x4, 0x1000404, 0x10404, 0x1010404, 0x10004, 0x1010000, 0x1000404, 0x1000004, 0x404, 0x10404, 0x1010400, 0x404, 0x1000400, 0x1000400, 0, 0x10004, 0x10400, 0, 0x1010004);
	    var spfunction2 = new Array(-0x7fef7fe0, -0x7fff8000, 0x8000, 0x108020, 0x100000, 0x20, -0x7fefffe0, -0x7fff7fe0, -0x7fffffe0, -0x7fef7fe0, -0x7fef8000, -0x8000000, -0x7fff8000, 0x100000, 0x20, -0x7fefffe0, 0x108000, 0x100020, -0x7fff7fe0, 0, -0x8000000, 0x8000, 0x108020, -0x7ff00000, 0x100020, -0x7fffffe0, 0, 0x108000, 0x8020, -0x7fef8000, -0x7ff00000, 0x8020, 0, 0x108020, -0x7fefffe0, 0x100000, -0x7fff7fe0, -0x7ff00000, -0x7fef8000, 0x8000, -0x7ff00000, -0x7fff8000, 0x20, -0x7fef7fe0, 0x108020, 0x20, 0x8000, -0x8000000, 0x8020, -0x7fef8000, 0x100000, -0x7fffffe0, 0x100020, -0x7fff7fe0, -0x7fffffe0, 0x100020, 0x108000, 0, -0x7fff8000, 0x8020, -0x8000000, -0x7fefffe0, -0x7fef7fe0, 0x108000);
	    var spfunction3 = new Array(0x208, 0x8020200, 0, 0x8020008, 0x8000200, 0, 0x20208, 0x8000200, 0x20008, 0x8000008, 0x8000008, 0x20000, 0x8020208, 0x20008, 0x8020000, 0x208, 0x8000000, 0x8, 0x8020200, 0x200, 0x20200, 0x8020000, 0x8020008, 0x20208, 0x8000208, 0x20200, 0x20000, 0x8000208, 0x8, 0x8020208, 0x200, 0x8000000, 0x8020200, 0x8000000, 0x20008, 0x208, 0x20000, 0x8020200, 0x8000200, 0, 0x200, 0x20008, 0x8020208, 0x8000200, 0x8000008, 0x200, 0, 0x8020008, 0x8000208, 0x20000, 0x8000000, 0x8020208, 0x8, 0x20208, 0x20200, 0x8000008, 0x8020000, 0x8000208, 0x208, 0x8020000, 0x20208, 0x8, 0x8020008, 0x20200);
	    var spfunction4 = new Array(0x802001, 0x2081, 0x2081, 0x80, 0x802080, 0x800081, 0x800001, 0x2001, 0, 0x802000, 0x802000, 0x802081, 0x81, 0, 0x800080, 0x800001, 0x1, 0x2000, 0x800000, 0x802001, 0x80, 0x800000, 0x2001, 0x2080, 0x800081, 0x1, 0x2080, 0x800080, 0x2000, 0x802080, 0x802081, 0x81, 0x800080, 0x800001, 0x802000, 0x802081, 0x81, 0, 0, 0x802000, 0x2080, 0x800080, 0x800081, 0x1, 0x802001, 0x2081, 0x2081, 0x80, 0x802081, 0x81, 0x1, 0x2000, 0x800001, 0x2001, 0x802080, 0x800081, 0x2001, 0x2080, 0x800000, 0x802001, 0x80, 0x800000, 0x2000, 0x802080);
	    var spfunction5 = new Array(0x100, 0x2080100, 0x2080000, 0x42000100, 0x80000, 0x100, 0x40000000, 0x2080000, 0x40080100, 0x80000, 0x2000100, 0x40080100, 0x42000100, 0x42080000, 0x80100, 0x40000000, 0x2000000, 0x40080000, 0x40080000, 0, 0x40000100, 0x42080100, 0x42080100, 0x2000100, 0x42080000, 0x40000100, 0, 0x42000000, 0x2080100, 0x2000000, 0x42000000, 0x80100, 0x80000, 0x42000100, 0x100, 0x2000000, 0x40000000, 0x2080000, 0x42000100, 0x40080100, 0x2000100, 0x40000000, 0x42080000, 0x2080100, 0x40080100, 0x100, 0x2000000, 0x42080000, 0x42080100, 0x80100, 0x42000000, 0x42080100, 0x2080000, 0, 0x40080000, 0x42000000, 0x80100, 0x2000100, 0x40000100, 0x80000, 0, 0x40080000, 0x2080100, 0x40000100);
	    var spfunction6 = new Array(0x20000010, 0x20400000, 0x4000, 0x20404010, 0x20400000, 0x10, 0x20404010, 0x400000, 0x20004000, 0x404010, 0x400000, 0x20000010, 0x400010, 0x20004000, 0x20000000, 0x4010, 0, 0x400010, 0x20004010, 0x4000, 0x404000, 0x20004010, 0x10, 0x20400010, 0x20400010, 0, 0x404010, 0x20404000, 0x4010, 0x404000, 0x20404000, 0x20000000, 0x20004000, 0x10, 0x20400010, 0x404000, 0x20404010, 0x400000, 0x4010, 0x20000010, 0x400000, 0x20004000, 0x20000000, 0x4010, 0x20000010, 0x20404010, 0x404000, 0x20400000, 0x404010, 0x20404000, 0, 0x20400010, 0x10, 0x4000, 0x20400000, 0x404010, 0x4000, 0x400010, 0x20004010, 0, 0x20404000, 0x20000000, 0x400010, 0x20004010);
	    var spfunction7 = new Array(0x200000, 0x4200002, 0x4000802, 0, 0x800, 0x4000802, 0x200802, 0x4200800, 0x4200802, 0x200000, 0, 0x4000002, 0x2, 0x4000000, 0x4200002, 0x802, 0x4000800, 0x200802, 0x200002, 0x4000800, 0x4000002, 0x4200000, 0x4200800, 0x200002, 0x4200000, 0x800, 0x802, 0x4200802, 0x200800, 0x2, 0x4000000, 0x200800, 0x4000000, 0x200800, 0x200000, 0x4000802, 0x4000802, 0x4200002, 0x4200002, 0x2, 0x200002, 0x4000000, 0x4000800, 0x200000, 0x4200800, 0x802, 0x200802, 0x4200800, 0x802, 0x4000002, 0x4200802, 0x4200000, 0x200800, 0, 0x2, 0x4200802, 0, 0x200802, 0x4200000, 0x800, 0x4000002, 0x4000800, 0x800, 0x200002);
	    var spfunction8 = new Array(0x10001040, 0x1000, 0x40000, 0x10041040, 0x10000000, 0x10001040, 0x40, 0x10000000, 0x40040, 0x10040000, 0x10041040, 0x41000, 0x10041000, 0x41040, 0x1000, 0x40, 0x10040000, 0x10000040, 0x10001000, 0x1040, 0x41000, 0x40040, 0x10040040, 0x10041000, 0x1040, 0, 0, 0x10040040, 0x10000040, 0x10001000, 0x41040, 0x40000, 0x41040, 0x40000, 0x10041000, 0x1000, 0x40, 0x10040040, 0x1000, 0x41040, 0x10001000, 0x40, 0x10000040, 0x10040000, 0x10040040, 0x10000000, 0x40000, 0x10001040, 0, 0x10041040, 0x40040, 0x10000040, 0x10040000, 0x10001000, 0x10001040, 0, 0x10041040, 0x41000, 0x41000, 0x1040, 0x1040, 0x40040, 0x10000000, 0x10041000);
	    var keys = this.des_createKeys(key);
	    var m = 0, i, j, temp, temp2, right1, right2, left, right, looping;
	    var cbcleft, cbcleft2, cbcright, cbcright2;
	    var endloop, loopinc;
	    var len = message.length;
	    var chunk = 0;
	    var iterations = keys.length == 32 ? 3 : 9;
	
	    if (iterations == 3) {
	        looping = encrypt ? new Array(0, 32, 2) : new Array(30, -2, -2);
	    }
	    else {
	        looping = encrypt ? new Array(0, 32, 2, 62, 30, -2, 64, 96, 2) : new Array(94, 62, -2, 32, 64, 2, 30, -2, -2);
	    }
	
	    message += "\0\0\0\0\0\0\0\0";
	    result = "";
	    tempresult = "";
	    if (mode == 1) {
	        cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
	        cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++); m = 0;
	    }
	    while (m < len) {
	        if (encrypt) {
	            left = (message.charCodeAt(m++) << 16) | message.charCodeAt(m++); right = (message.charCodeAt(m++) << 16) | message.charCodeAt(m++);
	        }
	        else {
	            left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
	            right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
	        }
	
	        if (mode == 1) {
	            if (encrypt) {
	                left ^= cbcleft; right ^= cbcright;
	            }
	            else {
	                cbcleft2 = cbcleft; cbcright2 = cbcright; cbcleft = left; cbcright = right;
	            }
	        }
	
	        temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
	        right ^= temp;
	        left ^= (temp << 4);
	        temp = ((left >>> 16) ^ right) & 0x0000ffff;
	        right ^= temp;
	        left ^= (temp << 16);
	        temp = ((right >>> 2) ^ left) & 0x33333333;
	        left ^= temp;
	        right ^= (temp << 2);
	        temp = ((right >>> 8) ^ left) & 0x00ff00ff;
	        left ^= temp; right ^= (temp << 8);
	        temp = ((left >>> 1) ^ right) & 0x55555555;
	        right ^= temp;
	        left ^= (temp << 1);
	        left = ((left << 1) | (left >>> 31));
	        right = ((right << 1) | (right >>> 31));
	        for (j = 0; j < iterations; j += 3) {
	            endloop = looping[j + 1];
	            loopinc = looping[j + 2];
	            for (i = looping[j]; i != endloop; i += loopinc) {
	                right1 = right ^ keys[i];
	                right2 = ((right >>> 4) | (right << 28)) ^ keys[i + 1];
	                temp = left;
	                left = right;
	                right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f] | spfunction6[(right1 >>> 8) & 0x3f] | spfunction8[right1 & 0x3f] | spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) & 0x3f] | spfunction5[(right2 >>> 8) & 0x3f] | spfunction7[right2 & 0x3f]);
	            }
	
	            temp = left;
	            left = right;
	            right = temp;
	        }
	        left = ((left >>> 1) | (left << 31));
	        right = ((right >>> 1) | (right << 31));
	        temp = ((left >>> 1) ^ right) & 0x55555555;
	        right ^= temp; left ^= (temp << 1);
	        temp = ((right >>> 8) ^ left) & 0x00ff00ff;
	        left ^= temp; right ^= (temp << 8);
	        temp = ((right >>> 2) ^ left) & 0x33333333;
	        left ^= temp; right ^= (temp << 2);
	        temp = ((left >>> 16) ^ right) & 0x0000ffff;
	        right ^= temp; left ^= (temp << 16);
	        temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
	        right ^= temp; left ^= (temp << 4);
	        if (mode == 1) {
	            if (encrypt) {
	                cbcleft = left;
	                cbcright = right;
	            }
	            else {
	                left ^= cbcleft2;
	                right ^= cbcright2;
	            }
	        }
	
	        if (encrypt) {
	            tempresult += String.fromCharCode((left >>> 24), ((left >>> 16) & 0xff), ((left >>> 8) & 0xff), (left & 0xff), (right >>> 24), ((right >>> 16) & 0xff), ((right >>> 8) & 0xff), (right & 0xff));
	        }
	        else {
	            tempresult += String.fromCharCode(((left >>> 16) & 0xffff), (left & 0xffff), ((right >>> 16) & 0xffff), (right & 0xffff));
	        }
	
	        encrypt ? chunk += 16 : chunk += 8;
	
	        if (chunk == 512) {
	            result += tempresult;
	            tempresult = "";
	            chunk = 0;
	        }
	    }
	
	    return result + tempresult;
	}
	
	//密鑰生成函數
	PG.Crypto.des_createKeys = function(key) {
	    pc2bytes0 = new Array(0, 0x4, 0x20000000, 0x20000004, 0x10000, 0x10004, 0x20010000, 0x20010004, 0x200, 0x204, 0x20000200, 0x20000204, 0x10200, 0x10204, 0x20010200, 0x20010204);
	    pc2bytes1 = new Array(0, 0x1, 0x100000, 0x100001, 0x4000000, 0x4000001, 0x4100000, 0x4100001, 0x100, 0x101, 0x100100, 0x100101, 0x4000100, 0x4000101, 0x4100100, 0x4100101);
	    pc2bytes2 = new Array(0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808, 0, 0x8, 0x800, 0x808, 0x1000000, 0x1000008, 0x1000800, 0x1000808);
	    pc2bytes3 = new Array(0, 0x200000, 0x8000000, 0x8200000, 0x2000, 0x202000, 0x8002000, 0x8202000, 0x20000, 0x220000, 0x8020000, 0x8220000, 0x22000, 0x222000, 0x8022000, 0x8222000);
	    pc2bytes4 = new Array(0, 0x40000, 0x10, 0x40010, 0, 0x40000, 0x10, 0x40010, 0x1000, 0x41000, 0x1010, 0x41010, 0x1000, 0x41000, 0x1010, 0x41010);
	    pc2bytes5 = new Array(0, 0x400, 0x20, 0x420, 0, 0x400, 0x20, 0x420, 0x2000000, 0x2000400, 0x2000020, 0x2000420, 0x2000000, 0x2000400, 0x2000020, 0x2000420);
	    pc2bytes6 = new Array(0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002, 0, 0x10000000, 0x80000, 0x10080000, 0x2, 0x10000002, 0x80002, 0x10080002);
	    pc2bytes7 = new Array(0, 0x10000, 0x800, 0x10800, 0x20000000, 0x20010000, 0x20000800, 0x20010800, 0x20000, 0x30000, 0x20800, 0x30800, 0x20020000, 0x20030000, 0x20020800, 0x20030800);
	    pc2bytes8 = new Array(0, 0x40000, 0, 0x40000, 0x2, 0x40002, 0x2, 0x40002, 0x2000000, 0x2040000, 0x2000000, 0x2040000, 0x2000002, 0x2040002, 0x2000002, 0x2040002);
	    pc2bytes9 = new Array(0, 0x10000000, 0x8, 0x10000008, 0, 0x10000000, 0x8, 0x10000008, 0x400, 0x10000400, 0x408, 0x10000408, 0x400, 0x10000400, 0x408, 0x10000408);
	    pc2bytes10 = new Array(0, 0x20, 0, 0x20, 0x100000, 0x100020, 0x100000, 0x100020, 0x2000, 0x2020, 0x2000, 0x2020, 0x102000, 0x102020, 0x102000, 0x102020);
	    pc2bytes11 = new Array(0, 0x1000000, 0x200, 0x1000200, 0x200000, 0x1200000, 0x200200, 0x1200200, 0x4000000, 0x5000000, 0x4000200, 0x5000200, 0x4200000, 0x5200000, 0x4200200, 0x5200200);
	    pc2bytes12 = new Array(0, 0x1000, 0x8000000, 0x8001000, 0x80000, 0x81000, 0x8080000, 0x8081000, 0x10, 0x1010, 0x8000010, 0x8001010, 0x80010, 0x81010, 0x8080010, 0x8081010);
	    pc2bytes13 = new Array(0, 0x4, 0x100, 0x104, 0, 0x4, 0x100, 0x104, 0x1, 0x5, 0x101, 0x105, 0x1, 0x5, 0x101, 0x105);
	    var iterations = key.length >= 24 ? 3 : 1;
	    var keys = new Array(32 * iterations);
	    var shifts = new Array(0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
	    var lefttemp, righttemp, m = 0, n = 0, temp;
	
	    for (var j = 0; j < iterations; j++) {
	        left = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
	        right = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
	        temp = ((left >>> 4) ^ right) & 0x0f0f0f0f;
	        right ^= temp;
	        left ^= (temp << 4);
	        temp = ((right >>> -16) ^ left) & 0x0000ffff;
	        left ^= temp;
	        right ^= (temp << -16);
	        temp = ((left >>> 2) ^ right) & 0x33333333;
	        right ^= temp;
	        left ^= (temp << 2);
	        temp = ((right >>> -16) ^ left) & 0x0000ffff;
	        left ^= temp; right ^= (temp << -16);
	        temp = ((left >>> 1) ^ right) & 0x55555555;
	        right ^= temp; left ^= (temp << 1);
	        temp = ((right >>> 8) ^ left) & 0x00ff00ff;
	        left ^= temp; right ^= (temp << 8);
	        temp = ((left >>> 1) ^ right) & 0x55555555;
	        right ^= temp; left ^= (temp << 1);
	        temp = (left << 8) | ((right >>> 20) & 0x000000f0);
	        left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
	        right = temp;
	
	        for (i = 0; i < shifts.length; i++) {
	            if (shifts[i]) {
	                left = (left << 2) | (left >>> 26); right = (right << 2) | (right >>> 26);
	            }
	            else {
	                left = (left << 1) | (left >>> 27);
	                right = (right << 1) | (right >>> 27);
	            }
	            left &= -0xf;
	            right &= -0xf;
	            lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[(left >>> 24) & 0xf] | pc2bytes2[(left >>> 20) & 0xf] | pc2bytes3[(left >>> 16) & 0xf] | pc2bytes4[(left >>> 12) & 0xf] | pc2bytes5[(left >>> 8) & 0xf] | pc2bytes6[(left >>> 4) & 0xf];
	            righttemp = pc2bytes7[right >>> 28] | pc2bytes8[(right >>> 24) & 0xf] | pc2bytes9[(right >>> 20) & 0xf] | pc2bytes10[(right >>> 16) & 0xf] | pc2bytes11[(right >>> 12) & 0xf] | pc2bytes12[(right >>> 8) & 0xf] | pc2bytes13[(right >>> 4) & 0xf];
	            temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff;
	            keys[n++] = lefttemp ^ temp;
	            keys[n++] = righttemp ^ (temp << 16);
	        }
	    }
	
	
	
	    return keys;
	}
	
	//將普通的字符串轉換成16進制代碼的字符串
	PG.Crypto.stringToHex = function(s) {
	    var r = ""; var hexes = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
	    for (var i = 0; i < (s.length); i++) { r += hexes[s.charCodeAt(i) >> 4] + hexes[s.charCodeAt(i) & 0xf]; }
	    return r;
	}
	
	//將16進制代碼的字符串轉換成普通的字符串
	PG.Crypto.HexTostring = function(s) {
	    var r = "";
	    for (var i = 0; i < s.length; i += 2) { var sxx = parseInt(s.substring(i, i + 2), 16); r += String.fromCharCode(sxx); }
	    return r;
	}
		
		window.PG.Crypto=PG.Crypto;
};
NSCrypto();
/*
用法如下:
1.在前台頁面使用(javascript)Encrypt(message,key)函數加密數據,並傳到服務器,對應的,在服務器端使用(C#)DesDecrypt(key,message)解密得到原始數據. 
2.同理:在服務器端使用(C#) DesEncrypt(key,message)加密數據,在頁面上使用(javascript)Decrypt(message,key)解密,得到數據.
*/