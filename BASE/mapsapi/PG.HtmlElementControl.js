/**
		本文件是JS API之中的PG.HtmlElementControl類,用來將一個HTML內容以控件模式添加到地圖
		每個控件應該有initialize,getObject,depose三個方法
				
*/
function NSHtmlElementControl(){
		
	function HtmlElementControl(div)
	{
		PG.Tool.inherit(this,PG.Control);
		this.div=(typeof(div)=="object")?div:document.getElementById(div);
		this.div._control=this;
		if(this.div.parentNode){this.div.parentNode.removeChild(this.div);}
		this.div.style.position = "absolute";
		PG.Event.addListener(this.div,"mousedown",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"selectstart",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"click",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(this.div,"dblclick",PG.Event.returnTrue);//指定控件層的dblclick事件返回true
	}
	PG.HtmlElementControl = HtmlElementControl;

	/**
		初始化
	*/
	PG.HtmlElementControl.prototype.initialize=function(map)
	{
		this.map=map;
	};

	/**
		返回容器
	*/
	PG.HtmlElementControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		
	*/
	PG.HtmlElementControl.prototype.remove=function()
	{
		this.map=null;
	};

	/**
		銷毀該控件 
	*/
	PG.HtmlElementControl.prototype.depose=function()
	{
		this.div._control=null;
		PG.Event.deposeNode(this.div);
		this.div=null;
	};
	window.PG.HtmlElementControl=PG.HtmlElementControl;

}
NSHtmlElementControl();