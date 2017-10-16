/**
	本文件是JS API之中的瀏覽器信息對像,用來判斷是否為特定的瀏覽器
*/
function NSBrowserInfo()
{
	function BrowserInfo(){}
	PG.BrowserInfo = BrowserInfo;

	/**
		如果是Opera瀏覽器,返回真
	*/
	PG.BrowserInfo.isOpera = function()
	{
		return navigator.appName.indexOf("opera")!=-1;
	};

	/**
		如果是IE瀏覽器,返回真
	*/
	PG.BrowserInfo.isIE = function()
	{
		return navigator.appName.indexOf("Microsoft Internet Explorer")!=-1 && document.all;
	};

	/**
		如果是Netscape瀏覽器,返回真
	*/
	PG.BrowserInfo.isNN = function()
	{
		return navigator.userAgent.indexOf("Netscape")!=-1;
	};

	/**
		如果是Firefox瀏覽器,返回真
	*/
	PG.BrowserInfo.isFF = function(){
		return navigator.userAgent.indexOf("Firefox")!=-1;
	};

	/**
		得到瀏覽器的類型
	*/
	PG.BrowserInfo.getBrowserType = function()
	{
		return PG.BrowserInfo.isIE()?"IE":(PG.BrowserInfo.isNN()?"NN":(PG.BrowserInfo.isFF()?"FF":(PG.BrowserInfo.isOpera()?"Opera":"Other")));
	};

	/**
		得到瀏覽器的版本
	*/
	PG.BrowserInfo.getBrowserVersion = function()
	{
		var version=navigator.userAgent.split(String.fromCharCode(32));
		if(PG.BrowserInfo.isIE())
		{
			for(var i=0;i<version.length;i++)
			{
				if(version[i].toUpperCase().indexOf("MSIE")!=-1)
				{
					return parseFloat(version[i+1]);
				}
			}
		}
		else
		{
			return PG.BrowserInfo.isNN()?parseFloat(version[version.length-1].split("/")[1]):(PG.BrowserInfo.isFF()?parseFloat(version[version.length-1].split("/")[1]):-1);
		}
	};

	/**
		得到操作系統類型
	*/
	PG.BrowserInfo.getOsType = function()
	{
		return (navigator.platform.toUpperCase().indexOf("WIN")!=-1)?"Windows":"Macintosh or ETC";
	};

	/**
		如果是iPhone或iPad,返回真
	*/
	PG.BrowserInfo.isMSF = function(){
		var isSF = false;
		if((navigator.userAgent.match(new RegExp("iPhone","i"))) ||(navigator.userAgent.match(new RegExp("iPad","i")))) {
			isSF = true;
		}
		return isSF;
	};

	/**
		如果是Android,返回真
	*/
	PG.BrowserInfo.isCL = function(){
		var isCL = false;
		if((navigator.userAgent.match(new RegExp("Android","i")))) {
			isCL = true;
		}
		return isCL;
	};

	window.PG.BrowserInfo=PG.BrowserInfo;
}
NSBrowserInfo();