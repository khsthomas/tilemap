(function(){
	window.PG = window.PG||{};
	Date.prototype.toJSON = function(key) {
		return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + this.f(this.getUTCDate()) + 'T' + this.f(this.getUTCHours()) + ':' + this.f(this.getUTCMinutes()) + ':' + this.f(this.getUTCSeconds()) + 'Z': null
	};
	Date.prototype.f = function(n) {
		return n < 10 ? '0' + n: n;
	};
	String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
		return this.valueOf()
	};
	function JSON(){}				

	JSON.prototype.quote = function(string){
		window.PG._JSON_escapable.lastIndex = 0;
		return window.PG._JSON_escapable.test(string) ? '"' + string.replace(window.PG._JSON_escapable,
		function(a) {
			var c = window.PG._JSON_meta[a];
			return typeof c === 'string' ? c: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice( - 4)
		}) + '"': '"' + string + '"'
	};

	JSON.prototype.str = function(key, holder){
		var i, k, v, length, mind = this.gap,
		partial, value = holder[key];
		if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
			value = value.toJSON(key)
		}
		if (typeof this.rep === 'function') {
			value = this.rep.call(holder, key, value)
		}
		switch (typeof value) {
		case 'string':
			return this.quote(value);
		case 'number':
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			return String(value);
		case 'object':
			if (!value) {
				return 'null'
			}
			this.gap += this.indent;
			partial = [];
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = this.str(i, value) || 'null'
				}
				v = partial.length === 0 ? '[]': this.gap ? '[\n' + this.gap + partial.join(',\n' + this.gap) + '\n' + mind + ']': '[' + partial.join(',') + ']';
				this.gap = mind;
				return v
			}
			if (this.rep && typeof this.rep === 'object') {
				length = this.rep.length;
				for (i = 0; i < length; i += 1) {
					if (typeof this.rep[i] === 'string') {
						k = this.rep[i];
						v = this.str(k, value);
						if (v) {
							partial.push(this.quote(k) + (this.gap ? ': ': ':') + v)
						}
					}
				}
			} else {
				for (k in value) {
					if (Object.prototype.hasOwnProperty.call(value, k)) {
						v = this.str(k, value);
						if (v) {
							partial.push(this.quote(k) + (this.gap ? ': ': ':') + v)
						}						
					}
				}
			}
			v = partial.length === 0 ? '{}': this.gap ? '{\n' + this.gap + partial.join(',\n' + this.gap) + '\n' + mind + '}': '{' + partial.join(',') + '}';
			this.gap = mind;
			return v
		}
	};
	JSON.prototype._stringify = function(value, replacer, space) {
		var i;
		this.gap = '';
		this.indent = '';
		if (typeof space === 'number') {
			for (i = 0; i < space; i += 1) {
				this.indent += ' '
			}
		} else if (typeof space === 'string') {
			this.indent = space
		}
		this.rep = replacer;
		if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
			throw new Error('JSON.stringify');
		}
		return this.str('', {'': value}).replace(/\"/ig,'\'');
	};

	JSON.stringify = function(value, replacer, space){
		if(value==''){return '';}
		var json = new PG.JSON();
		return json._stringify(value, replacer, space);
	};

	window.PG._JSON_cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	window.PG._JSON_escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	window.PG._JSON_meta = {'\b': '\\b','\t': '\\t','\n': '\\n','\f': '\\f','\r': '\\r','"': '\\"','\\': '\\\\'};
	window.PG.JSON = JSON;

	/**

		HelloWorld($name), HelloComplexWorld($mycomplextype)
		GetPoint($params)
		GetPolyline($params)
		GetPolygon($params) 
		GetPolygonSet($params)
		PolygonFromParams($params) 


		http://59.125.131.194/soap/WSserverjson.php?op=HelloWorld
		http://59.125.131.194/soap/WSserverjson.php?op=HelloComplexWorld
		http://59.125.131.194/soap/WSserverjson.php?op=GetPoint
		http://59.125.131.194/soap/WSserverjson.php?op=GetPolyline
		http://59.125.131.194/soap/WSserverjson.php?op=GetPolygon
		http://59.125.131.194/soap/WSserverjson.php?op=GetPolygonSet
		http://59.125.131.194/soap/WSserverjson.php?op=PolygonFromParams	
		
		http://59.125.131.194/WSserverjson.php?op={function}&wsret={wsdata}&Jsoncallback={ Callback }?params={params}
		以這個服務器的例子, 你要這麼給

		callback 是 JsonCallback
		returnVarName 是 wsret
		paramsName 是 params


		URL	說明	是否允許通信
		http://www.kuqin.com/lab/a.js
		http://www.kuqin.com/script/b.js		同一域名下不同文件夾	允許
		http://www.kuqin.com/a.js
		http://www.kuqin.com/b.js				同一域名下	允許
		http://www.kuqin.com:8000/a.js
		http://www.kuqin.com/b.js				同一域名，不同端口	不允許
		http://www.kuqin.com/a.js
		https://www.kuqin.com/b.js				同一域名，不同協議	不允許
		http://www.kuqin.com/a.js
		http://70.32.92.74/b.js					域名和域名對應ip	不允許
		http://www.kuqin.com/a.js
		http://script.kuqin.com/b.js			主域相同，子域不同	不允許
		http://www.ithao123.com/a.js
		http://www.kuqin.com/b.js				不同域名	不允許

	*/
	function WebService(ws_url,isPost,paramsName,returnVarName ,callback){
		this._ws_url = ws_url;
		var p = this.isNotPost();
		if(p===false){this._isPost=false;}else{this._isPost = (isPost===true)?true:false;}		
		this._paramsName = (this.isEmpty(paramsName))?'params':paramsName;
		this._returnVarName = (this.isEmpty(returnVarName))?'returnVarName':returnVarName;
		this._callback = (this.isEmpty(callback))?'callback':callback;
		
	}
	PG.WebService = WebService;

	/**
	 * 判斷不同域,則_isPost固定為false	
	 * 
	 * */
	PG.WebService.prototype.isNotPost = function()
	{
		var s=10;
		var e = window.location.toString();
		var a=e.substring(s);
		var b=e.substring(0,s+a.indexOf('/'));
		var c=this._ws_url.substring(s);
		var d=this._ws_url.substring(0,s+c.indexOf('/'));
		return b==d;		
	};
	
	/**
	 * 判斷字符串是否為空,如果為空則返回true,否則返回false	;	
	 * 
	 * */
	PG.WebService.prototype.isEmpty = function(data)
	{
		//return ((data || "").replace( /^(\s|\u00A0)+|(\s|\u00A0)+$/g, "" )) == "";
		var re = new RegExp("^(\s|\u00A0)+|(\s|\u00A0)+$","g");
		return ((data || "").replace(re,"")) == "";	
	};

	/**
		傳入使用這個WebService方法的名稱和參數陣列。取回這個WebService提供傳回的json物件。	
		http://59.125.131.194/soap/WSserverjson.php?op={func}&wsret={wsdata}&JsonCallback={callback}&point={x:124,y:234}
		
		
		主要有兩個技術問題:
		1,跨域;
		2,post提交;

		在同網段用post提交,否則用JSONP
	*/
	PG.WebService.prototype.WSCall=function(serviceName,params,retValName,async,errh)
	{
		if((!serviceName)&&(!params)&&(!_ws_url)){alert('Please give necessary param!');return;}
		var url = this._ws_url.replace("{serviceName}",serviceName);
		var s = url.indexOf('?');//判斷是否有?
		var html = [];
		var ret = (!this.isEmpty(retValName))?retValName:'wsdata';
		html.push(this._returnVarName+'='+encodeURIComponent(ret));//alert(PG.JSON.stringify(params));
		html.push(this._paramsName+'='+encodeURIComponent(PG.JSON.stringify(params)));
		window[ret]=null;
		if(this._isPost){
			if((typeof async == 'undefined'))async=true;//預設非同步		
			this.loadAJAXData(url,html.join('&'),false,ret,async,errh);
		}else{
			this.loadJSONPData(url + (s==(-1)?'?':'&') + html.join('&'),errh);
		}
		return null;
	};

	/**
		傳入使用這個WebService方法的名稱和參數及Callback function。
	*/
	PG.WebService.prototype.WSCallback=function(serviceName,params,callback,async,errh)
	{
		if((!serviceName)&&(!params)&&(!_ws_url)&&(!callback)){alert('Please give necessary param!');return;}
		var url = this._ws_url.replace("{serviceName}",serviceName);
		var s = url.indexOf('?');//判斷是否有?
		var html = [];			
		html.push(this._paramsName+'='+encodeURIComponent(PG.JSON.stringify(params)));
		
		var callbackfunc;
		if(typeof callback=='string'){
			callbackfunc=eval(callback);
		}else{ 
			callbackfunc=callback;
		}
		if(this._isPost){
			if((typeof async == 'undefined'))async=true;//預設非同步
			this.loadAJAXData(url,html.join('&'),true,callbackfunc,async,errh);
		}else{
			var g = PG.WebService.getGeneratorAJAXRequestName();
			window._PGSHR_[g]={};
			window._PGSHR_[g]._c=callbackfunc;
			window._PGSHR_[g].HR=function(data){if(this._c){this._c(data);}};
			html.push(this._callback+"="+encodeURIComponent("window._PGSHR_."+g+".HR"));
			this.loadJSONPData(url + (s==(-1)?'?':'&') + html.join('&'), errh, function() {
                         // script 下載並執行完後移除暫時的函式
                         window._PGSHR_[g] = undefined;
                         try {
                             delete window._PGSHR_[g];
                         }
                         catch(e) {}
                    });
		}
		return null;
	};

	/**
		加載數據javascript(JSONP),只能用非同步,全域變數
	*/
	PG.WebService.prototype.loadJSONPData=function(url,errh,callback)
	{
		var head = document.getElementsByTagName("head")[0];		
		if(!head){head = document.documentElement;}
		var script = document.createElement("script");
		script.src = url;	//alert(url);
		head.appendChild(script);
		//未授權錯誤重導向設定
		if(errh){script.onerror=errh;}
		//執行完畢移除, IE support onreadystatechange
		script.onload = script.onreadystatechange = function(){
			if((!this.readyState)||(this.readyState === "loaded")||(this.readyState === "complete")) 
			{
				script.onload = script.onreadystatechange = null;//detach event,避免執行兩次
				if(head && script.parentNode) 
				{
					//head.removeChild(script);
                     //head.removeChild(this);
					setTimeout(function(){head.removeChild(script);},10000);
				}
				//通常為清理暫時變數
				if(callback){callback();}       
			}
		};
	};

	/**
		加載數據(AJAX)
	*/
	PG.WebService.prototype.loadAJAXData=function(url,params,isC,c,async,errh)
	{
		var th = this;
		var request=PG.WebService.createHttpRequest();
		//async非同步request.open("post",url,true);, sync同步request.open("post",url,false);
		if((typeof async == 'undefined'))async=true;//預設非同步
		request.open("post",url,async);
		//post
		request.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
		request.setRequestHeader("X-Requested-With","XMLHttpRequest"); 
		//在非同步模式下，最佳實作方式不是去while「檢查 readyState 的狀態」，而是去「等待 readyState 的改變事件」 
		request.onreadystatechange=function()
		{
			//if(request.readyState!=4){return;}
			if (request.readyState == 4){
				if(request.status == 200){
					var d = eval(request.responseText);
					if(isC){c(d);}else{window[c] = d;}
				}
				//未授權錯誤重導向設定
				if(request.status == 401){
					if(errh){errh();}
				}	            
	        } 			
		};
		request.send(params);
	};

	/**
		創建Ajax核心對像XMLHttpRequest
	*/
	PG.WebService.createHttpRequest=function()
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

	/**
	* 系統callback function 命名生成器
	*
	* */
	window._PGSHR_={};
	window._PGSHR_.nameGeneratorIndex=0;
	window._PGSHR_.nameGeneratorDigit=1;
	window._PGSHR_._HADUSEDNAMES_={};
	PG.WebService.getGeneratorAJAXRequestName = function()
	{
			var n1="qwertyuiopasdfghjklzxcvbnm_QWERTYUIOPASDFGHJKLZXCVBNM";				//生成的變量使用的變量名稱
			var n2="qwertyuiopasdfghjklzxcvbnm_QWERTYUIOPASDFGHJKLZXCVBNM0123456789";	//生成的變量使用的變量名稱
			var newName='',index=window._PGSHR_.nameGeneratorIndex;
			var num=0,d=window._PGSHR_.nameGeneratorDigit;
			while(true)
			{
				for(var i=0;i<d;i++)
				{
					var str=(i==0)?n1:n2;
					var t=index%str.length;
					index=(index-t)/str.length;
					newName+=str.charAt(t);
				}
				if(!window._PGSHR_._HADUSEDNAMES_[newName]){break;}
				window._PGSHR_.nameGeneratorIndex++;
				if(window._PGSHR_.nameGeneratorIndex>=n1.length*Math.pow(n2.length,window._PGSHR_.nameGeneratorDigit-1))
				{
					window._PGSHR_.nameGeneratorIndex=0;
					window._PGSHR_.nameGeneratorDigit++;
				}
			}
			window._PGSHR_._HADUSEDNAMES_[newName]=newName;
			return '_PG_AJAX_'+newName;
	};

	window.PG.WebService=PG.WebService;
}());