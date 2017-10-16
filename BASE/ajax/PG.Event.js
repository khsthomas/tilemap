/**
	本文件是JS API之中的PG.Event類,提供系統的事件處理支持,包括瀏覽器集成的事件(如onclick),
	和擴展的事件(如zoom).
	PG.Event類提供的方法都是靜態方法,不需要初始化實例.

	全局變量PG.Event.allEvents(數組)保存所有註冊的事件
	其數據格式(listener)為[obj,event,handle](obj為所觸發的事件源,event為事件名稱,handle為處理函數)
	
	_ET__E_ 則是每個各別的 dom 物件所有註冊的事件(listeners)
*/
function NSEvent()
{
	function Event(){}	
	PG.Event = Event;

	/**
		返回一個對實例obj(為this)的handle方法的調用函數
	*/
	PG.Event.getCallback=function(obj,handle){return function(){return handle.apply(obj,arguments)};};

	/**
		檢查是否HTML集成控件,就是DOM
	*/
	PG.Event.isHtmlControl=function(obj){return (obj.tagName || obj==window || obj==document);};

	/**
		返回節點所在的窗口對像, 才能拿到window.event
	*/
	PG.Event.getObjWin=function(hObj)
	{
		return (hObj && hObj.ownerDocument && hObj.ownerDocument.parentWindow)?hObj.ownerDocument.parentWindow:window;
	};
	
	/**
		得到 原生的window event 對像
	*/
	PG.Event.getWindowEvent=function(argu)
	{
		if(!argu){argu=[];}
		if(!argu[0]){argu[0]=PG.Event.getObjWin().event;}
		//target 屬性指向觸發事件的dom元素
		if(argu[0] && !argu[0].target && argu[0].srcElement){argu[0].target=argu[0].srcElement};
		return argu;	
	};
	
	/**
		如果hObj是HTML集成控件,則生成該控件對於指定事件的觸發函數(hMethod)(參見PG.Event.bind)
	*/
	PG.Event.createAdapter=function(hObj,hMethod)
	{	
		return function(){hMethod.apply(hObj,PG.Event.getWindowEvent(arguments));}
	};

	/**
		中止windows集成事件處理的執行
		取消JS事件冒泡
	*/
	PG.Event.cancelBubble=function(e)
	{
		e=PG.Event.getWindowEvent(e);
		if(!e){return;}
		//document.all可以判断浏览器是否是IE
		if(document.all)
		{
			e.cancelBubble=true;
			e.returnValue=false
		}
		else if(e.stopPropagation)
		{
			e.preventDefault();
			e.stopPropagation();
		}
	};

	/**
		中止windows集成事件處理的執行並返回true
	*/
	PG.Event.returnTrue=function(e)
	{
		e=PG.Event.getWindowEvent(e);
		if(!e){return;}
		if(document.all)
		{
			e.cancelBubble=true;
			e.returnValue=true;
		}
		else if(e.stopPropagation)
		{
			e.stopPropagation();
		}
	};

	/**
		將hObj對象的hMethod方法綁定到obj的event事件,返回一個listener對像
		hObj不一定擁有hMethod方法,在hMethod內的this指到hObj
		return PG.Event.addListener(obj,event,
		PG.Event.isHtmlControl(obj)?
		PG.Event.createAdapter(hObj,hMethod):
		PG.Event.getCallback(hObj,hMethod),once);

	*/
	PG.Event.bind=function(obj,event,hObj,hMethod,once)
	{
		return PG.Event.addListener(obj,event,PG.Event.isHtmlControl(obj)?PG.Event.createAdapter(hObj,hMethod):PG.Event.getCallback(hObj,hMethod),once);
	};

	/**
		將節點及其子節點的全部都刪除, 遞迴, onlyChlid為是否連母節點也刪除
	*/
	PG.Event.deposeNode=function(node,onlyChild)
	{
		if(!node){return;}
		if(node.parentNode && !onlyChild){node.parentNode.removeChild(node);}
		PG.Event.clearListeners(node);
		var child;
		while(child=node.firstChild)
		{
			PG.Event.deposeNode(child);
		}
	};

	/**
		函數只執行一次,即移除
	*/
	PG.Event.runOnceHandle=function(handle,listener)
	{
		return function(){handle.apply(this,arguments);PG.Event.removeListener(listener);}
	};
	
	/**
		將handle函數綁定到obj的event事件,返回一個listener對像
		如果event=*,則搜索時間都會被處理
		once為真的話,則handle函數只執行一次
	*/
	PG.Event.addListener=function(obj,event,handle,once)
	{
		var listener=[obj,event];//listener[0]表物件, listener[1]表事件, listener[2]表handler,
		if(once){handle=PG.Event.runOnceHandle(handle,listener)}
		var type=PG.Event.isHtmlControl(obj);
		if(type)
		{//如果是HTML控件,則以HTML控件作為對像來運行
			handle=PG.Event.getCallback(obj,handle);
			if(obj.addEventListener){obj.addEventListener(event,handle,false);}
			else if(obj.attachEvent){obj.attachEvent("on"+event,handle);}//for IE
			else
			{//針對onload這種事件,是否事件的屬性值已存在挷定的handler function
				var oldEvent =obj["on"+event];
				if(typeof(oldEvent)=='function')
				{
					obj["on"+event]= function(){oldEvent();handle();};
				}
				else
				{
					obj["on"+event]=handle;
				}
			}
		}
		listener.push(handle);
		//tagname 不為svg shape 因無法收受事件
		if(obj._ET__E_ && type!="shape")
		{
			obj._ET__E_.push(listener);
		}
		else
		{  //svg shape tag, obj._ET__E_不會有listenser或初始化 []
			//初始化_ET__E_
			obj._ET__E_=(type=="shape")?[]:[listener];
		}
		//初始化 PG.Event.allEvents,並加入listener
		if(!PG.Event.allEvents){PG.Event.allEvents=[];}
		if(event!="unload"){PG.Event.allEvents.push(listener);}
		return listener;
	};

	/**
		刪除自訂事件註冊,注意不適用於瀏覽器集成的事件
		參數傳遞方法有二：
		1.傳入在addListener的物件移除
		2.也可以傳入 obj(dom)物件,事件名稱,handler函數來移除
		有自訂事件的obj會有_ET__E_為所有挷定的listensers
	*/
	PG.Event.removeListener=function(listener)
	{
		if(!listener || listener.length==0){return;}
		//參數>1
		if(arguments.length>1)
		{
			var listeners=arguments[0]._ET__E_;
			for(var i=0;i<listeners.length;i++){if(listeners[i][1]==arguments[1] && listeners[i][2]==arguments[2]){return PG.Event.removeListener(listeners[i]);}}
		}
		try{
			if(PG.Event.isHtmlControl(listener[0]))
			{
				if(listener[0].removeEventListener)
				{
					listener[0].removeEventListener(listener[1],listener[2],false);
				}
				else if(listener[0].detachEvent)
				{
					listener[0].detachEvent("on"+listener[1],listener[2]);
				}
				else
				{
					listener[0]["on"+listener[1]]=null;
				}
			}
			var array=listener[0]._ET__E_;
			for(var i=array.length-1;i>=0;i--)
			{
				if(array[i]==listener)
				{
					array.splice(i,1);
					break;
				}
			}
		}catch(e){}
		//將事件移出allEvent
		array=PG.Event.allEvents;
		for(var i=array.length-1;i>=0;i--)
		{
			if(array[i]==listener)
			{
				array.splice(i,1);
				break;
			}
		}
		//primitive type是passByValue, object則是PassByReference
		while(listener.length>0){listener.pop();}
		delete listener;
	};

	/**
		刪除事件註冊,注意不適用於瀏覽器集成的事件
	*/
	PG.Event.clearListeners=function(obj,event)
	{
		if(!obj || !obj._ET__E_){return;}
		var listener,listeners=obj._ET__E_;
		for(var i=listeners.length-1;i>=0;i--)
		{
			listener=listeners[i];
			if(!event || listener[1]==event)
			{
				PG.Event.removeListener(listener);
			}
		}
		PG.Event.trigger(PG.Event,"clearlisteners",[obj]);
	};

	/**
		刪除所有系統之中事件註冊
	*/
	PG.Event.clearAllListeners=function()
	{
		var listeners=PG.Event.allEvents;
		if(listeners)
		{
			for(var i=listeners.length-1;i>=0;i--)
			{
				PG.Event.removeListener(listeners[i]);
			}
		}
		PG.Event.allEvents=null;
	};

	/**
		觸發obj的event事件,args是觸發的參數
		允許通過*來捕獲所有的事件
	*/
	PG.Event.trigger=function(obj,event,args)
	{
		//先觸發dom的方法
		if(PG.Event.isHtmlControl(obj))
		{
			try{
				//for IE object.fireEvent(bstrEventName, pvarEventObject, pfCancelled) 
			if(obj.fireEvent){obj.fireEvent("on"+event);}
				//for firefox
			if(obj.dispatchEvent){obj.dispatchEvent(event);}
			}catch(e){}
		}
		//再觸發自行定義的方法
		if(!args){args=[];}
		var listeners=obj._ET__E_;//_ET__E_為obj通過addListener方法註冊的所有事件
		if(listeners&&listeners.length>0)
		{
			for(var i=listeners.length-1;i>=0;i--)
			{
				var listener=listeners[i];
				if(listener && listener[2])
				{
					if(listener[1]=="*")
					{
						listener[2].apply(obj,[event,args]);
					}
					if(listener[1]==event)
					{
						listener[2].apply(obj,args);
					}
				}
			}
		}
	};

	/**
		判斷頁面(document)是否已經加載 bool
	*/
	PG.Event.isDocumentLoaded=function()
	{
		return document.all?(document.readyState!="loading" && document.readyState!="interactive"):(PG.Event.readyState=="complete")
	};

	/**
		頁面加載後執行的函數
	*/
	PG.Event.load=function()
	{
		if(!PG.Event.unLoadListener){
			PG.Event.unLoadListener=PG.Event.addListener(window,"unload",PG.Event.clearAllListeners);
			}
		if(!document.all && !PG.Event.readyState)
		{
			PG.Event.readyState="interactive";
			//The DOMContentLoaded event fires when parsing of the current page is complete; 
			//the load event fires when all files have finished loading from all resources, including ads and images. 
			//DOMContentLoaded is a great event to use to hookup UI functionality to complex web pages.
			//改完成html文件的解析(DOMContentLoaded), 但資源未全下載,算complete
			PG.Event.addListener(document,"DOMContentLoaded",function(){PG.Event.readyState="complete";},true);
		}
	};
	window.PG.Event=PG.Event;
	PG.Event.load();
}
NSEvent();