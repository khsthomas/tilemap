/**
	本文件是JS API之中的PG.WindowEntity,PG.WindowEntityTab類

*/
function MapNSWindowEntity()
{	
	/**
		根據給定的地理位置坐標創建信息浮窗	

		point:		信息浮窗所指向的地理位置坐標
		offset:		表示信息浮窗顯示時向右下角偏移量(像素),默認不偏移
	*/
	function WindowEntity(point,offset,config)
	{
		if(offset&&PG.Tool.isArray(offset)){
			offset = new PG.Point(offset[0],[1]);
		}
		this.imgSrc=window.PG._IMG_PATH+"iw/";
		if(point){this.SetPoint(point,offset);}
		this.config=config?config:((window.PG._info_config)?window.PG._info_config:{});
		this.offset=offset?offset: new PG.Point(0,0);
		this.div =PG.Tool.createDiv(1,null,560);
		this.type = window.PG.ENTITY_INFOWIN;
		this.title=PG.Tool.createDiv(0);
		this.title.style.overflowX="hidden";
		this.title.style.visibility="hidden";
		this.bInfo = PG.Tool.browserInfo();		

		this.content=PG.Tool.createDiv(1);
		PG.Event.addListener(this.content,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.returnTrue);
		PG.Event.addListener(this.content,"selectstart",PG.Event.returnTrue);
		PG.Event.addListener(this.content,this.bInfo.isMwk?"touchstart":"click",PG.Event.returnTrue);
		PG.Event.addListener(this.content,"dblclick",PG.Event.returnTrue);
		this.markerOffset=[0,0];
		this.createInfoWin();
		this.created=true;
		this.clear=this.DisableCloseWindowOnMouseOut;
		this.maxTitleLength=(window.PG._maxTitleLength)?window.PG._maxTitleLength:15;//最大的標題長度,超過則截取
		//設置投影
		this.SetShadow();
		
		
	}
	PG.WindowEntity = WindowEntity;

	/**
		返回疊加物類型		
	*/
	PG.WindowEntity.prototype.GetType = function(){	
		return this.type;
	};

	/**
		自定義信息浮窗的繪製函數		
	*/
	PG.WindowEntity.prototype.createInfoWin=function()
	{
		var cursorSize=[51,31];
		var imgSrc=this.imgSrc;
		this.SetSize([150,30]);
		this.markerOffset=[0.5,0];
		this.cursorPer=0.7;

		//指向點圖片
		var img_p=new Image(cursorSize[0],cursorSize[1]);
		var img_p_url=imgSrc+"iw_tail.png";
		PG.WindowEntity.setPngSrc(img_p,img_p_url);
		PG.Tool.setCssText(img_p,'z-index: 1;position: absolute;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image,src='+img_p_url+')');
		this.div.appendChild(img_p);
		this.cursor=img_p;

		//內容區整體層
		var div_ctx=PG.Tool.createDiv(1);
		this.div.appendChild(div_ctx);
		this.containerDiv=div_ctx;
		PG.Tool.setCssText(div_ctx,'position: absolute; cursor: default; border: 1px solid rgb(153, 153, 153); background-color: rgb(255, 255, 255); ');
		
		//內容區標題
		var title_ctx=PG.Tool.createDiv(1);
		PG.Tool.setCssText(title_ctx,'border-bottom: 1px solid #ccc; height: 25px');

		var title_ctx1=PG.Tool.createDiv(1);
		PG.Tool.setCssText(title_ctx1,'line-height: 24px; height: 24px; background-color: rgb(249, 249, 249); overflow: auto; white-space: nowrap; ');
		
		var title_ctx2=document.createElement('P');		
		title_ctx2.style.margin='0px';
		title_ctx2.style.padding='0px';

		var title_ctx3=PG.Tool.createDiv(1);
		title_ctx3.className="se_infowin_tit";
		title_ctx3.style.margin='0px';
		title_ctx3.style.padding='0 0 0 10px';
		title_ctx3.style.fontSize='14px';
		title_ctx3.style.fontWeight='bold';
		this.title_ctx3=title_ctx3;

		title_ctx2.appendChild(title_ctx3);
		title_ctx1.appendChild(title_ctx2);
		title_ctx.appendChild(title_ctx1);
		this.title.appendChild(title_ctx);
		this.containerDiv.appendChild(this.title);

		//內容區
		this.containerDiv.appendChild(this.content);
		this.content.className="se_infowin_content";
		this.content.style.position='absolute';
		this.content.style.left='0px';
		this.content.style.padding='0 10px 0 10px';
		this.content.style.color='#333333';
		this.content.style.fontSize='12px';
		this.content.style.marginTop='-10px';
		this.content.style.minWidth = "150px";
		
				
		//關閉按鈕
		var img_d=PG.Tool.createDiv(1);
        PG.Tool.setCssText(img_d,'float: right; position: absolute; top: 1px; right: 0px; height: 24px;');
		var img_d1=PG.Tool.createDiv(1);
		PG.Tool.setCssText(img_d1,'width: 32px; height: 24px');
		var img_c=new Image(10,10);
		img_c.src=imgSrc+"iw_close.gif";
		img_c.className="se_infowin_close";
		img_c.style.position='absolute';
		img_c.style.top='7px';
		img_c.style.right='8px';
		img_c.style.width='10px';
		img_c.style.height='10px';
		PG.Tool.setCursorStyle(img_c,"pointer");

		img_d1.appendChild(img_c);
		img_d.appendChild(img_d1);
		this.div.appendChild(img_d);
		this._se_infowin_close=img_d;
		
		PG.Event.addListener(img_c,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.cancelBubble);
		PG.Event.bind(img_c,this.bInfo.isMwk?"touchstart":"click",this,this.CloseWindow);
		this.cursorSize=cursorSize;
	};

	/**
		在信息浮窗大小或者內容發生變化的時候重新設置一些層的位置,可以用來做自適應大小的功能		

		這個函數里面的廣告部分去掉了---如有需求,請參考以前版本
	*/
	PG.WindowEntity.prototype.changeInfoWin=function()
	{
		var cursorSize=this.cursorSize;
		var titleHeight=this.title.offsetHeight;

		this.containerDiv.style.width = "auto";
		this.content.style.minWidth = "150px";
		this.containerDiv.style.height = "auto";

		//this.size為用戶設置的寬度和高度
		var asize=[
					Math.max(this.title.offsetWidth,this.content.offsetWidth,this.size[0])+2,
					Math.max(this.content.offsetHeight,this.size[1])+(cursorSize[1]-1)+titleHeight+15
				  ];

		this.div.style.width=asize[0]+"px";
		this.div.style.height=asize[1]+"px";
		this.containerDiv.style.width=asize[0]+"px";
		
		this.containerDiv.style.height=asize[1]-(cursorSize[1]-1)+"px";
		this.content.style.top=titleHeight+1+"px";

		this.cursor.style.top=(asize[1]-this.cursorSize[1]+2)+"px";
		this.cursor.style.right=(asize[0]*(1-this.cursorPer)-2)+"px";
									
		this.asize=asize;

		for(var i=0;i<this.content.childNodes.length;i++)
		{
			var child=this.content.childNodes[i];
			if(child.width || (child.style && child.style.width))
			{
				var w=child.width?child.width.toString():child.style.width;
				if(w && w.indexOf("%")==w.length-1)
				{
					child.style.width=(this.size[0])*parseInt(w)/100+"px";
				}
			}
			if(child.height || (child.style && child.style.height))
			{
				var h=child.height?child.height.toString():child.style.height;
				if(h && h.indexOf("%")==h.length-1)
				{
					child.style.height=(this.size[1])*parseInt(h)/100+"px";
				}
			}
		}
		
		PG.Event.trigger(this,"resize",[this.asize]);
	};

	/**
		移動地圖以確保信息浮窗在地圖顯示範圍內		
	*/
	PG.WindowEntity.prototype.AdjustToShow=function(padding)
	{
		padding=padding?padding:5;
		var map=this.map;
		if(!map){return;}
		var mapSize=this.map.GetWindow();
		var winSize=this.asize;
		var point=map.slideObject?map.slideObject.toPoint:map.centerPoint;
		var position=this.map.fromLatLngToContainerPixel(this.GetPoint(),point);
		var anchor=this.getAnchorPoint();
		var offset=this.offset;
		var left=position[0]+anchor[0]+offset.x;
		var top=position[1]+anchor[1]+offset.y;
		var right=mapSize[0]-position[0]-(winSize[0]+anchor[0])-offset.x;
		var bottom=mapSize[1]-position[1]-(winSize[1]+anchor[1])-offset.y;
		var p=[0,0];
		if(left*right<0)
		{
			p[0]+=Math.min(left,right)-padding;
			if(right<0){p[0]=-p[0];}
		}
		if(top*bottom<0)
		{
			p[1]+=Math.min(top,bottom)-padding;
			if(bottom<0){p[1]=-p[1];}
		}
		if(p[0]!=0 || p[1]!=0)
		{
			this.map.ZoomPan(this.map.fromContainerPixelToLatLng([mapSize[0]/2+p[0],mapSize[1]/2+p[1]],point));
		}
	};

	/**
		獲取infowin的錨點相對於div層左上角的位置		
	*/
	PG.WindowEntity.prototype.getAnchorPoint=function()
	{
		return [-this.asize[0]*this.cursorPer+this.cursorSize[0]-2,-this.asize[1]+2];
	};	

	/**
		設置大小		
	*/
	PG.WindowEntity.prototype.SetSize=function(size)
	{
		this.size=size;
		if(PG.Tool.isInDocument(this.div)){this.reDraw(true);}
	};

	/**
		初始化		
	*/
	PG.WindowEntity.prototype.initialize = function( map )
	{
		if(!this.div || this.map){return false;}
		this.map = map;
		PG.Event.trigger(this,"initialize",[]);
		
	};

	/**
		返回容器		
	*/
	PG.WindowEntity.prototype.GetObject = function()
	{
		return this.div;
	};

	/**
		刪除		
	*/
	PG.WindowEntity.prototype.remove = function()
	{
		this.map=null;
		PG.Event.trigger(this,"remove",[]);
	};

	/**
		銷毀		
	*/
	PG.WindowEntity.prototype.depose = function()
	{
		PG.Event.deposeNode(this.div);
		this.div=null;
		PG.Event.trigger(this,"depose",[]);
	};

	/**
		重新繪製		
	*/
	PG.WindowEntity.prototype.reDraw = function(booleans)
	{
		if(!booleans || !this.map){return;}
		var position = this.map.GetRelativeXY( this.point );//
		if( position[2])
		{//點在可視範圍內
			if(!PG.Tool.isInDocument(this.div))
			{//如果不存在
				this.map.overlaysDiv.appendChild( this.div );
			}
			this.changeInfoWin();
			var anchor=this.getAnchorPoint();
			if(this.anchorObj && this.anchorObj.map)
			{
				var size=this.anchorObj.focusSize;
				if(!size){size=this.anchorObj.GetSize();}
				var ach=this.anchorObj.GetAnchor();
				var o = [-ach.x+size.width*this.markerOffset[0],-ach.y+size.height*this.markerOffset[1]];
				this.offset=new PG.Point(o[0],o[1]);
			}
			anchor[0]+=this.offset.x;
			anchor[1]+=this.offset.y;
			PG.Tool.setPosition(this.div,[position[0]+anchor[0],position[1]+anchor[1]]);
		}
		else
		{//點不在可視範圍內
			if(PG.Tool.isInDocument(this.div))
			{//如果標點已經存在
				this.div.parentNode.removeChild( this.div );
			}
		}
	};

	/**
		設置信息浮窗的顯示HTML內容	
		label	: 該參數有三種類型:
               1,HTML對像;
			   2,HTML字符串;
			   3,Array< PG.WindowEntityTab >,該參數用於創建信息窗口選項卡。
	*/
	PG.WindowEntity.prototype.SetText=function(label)
	{
		this._label = label;
		var temp;
		while(temp = this.content.firstChild){
			this.content.removeChild(temp);
		}
		if(PG.Tool.isArray(label)){
			var d= this.createTabs(this._label);
			this.content.appendChild( d );
		}else{
//		inner比removeChild更快
			if(typeof(label)=="object")
			{
				this.content.appendChild( label );
			}
			else
			{
				this.content.innerHTML=label;
			}
		}
		if(this.created){this.changeInfoWin();}
		if(PG.Tool.isInDocument(this.div)){this.reDraw(true);}
	};

	/**
		設置信息浮窗的顯示標題		
		label	: 該參數有三種類型:1,HTML對像;2,HTML字符串;
	*/
	PG.WindowEntity.prototype.SetTitle = function(label)
	{
		var flag=label&&PG.Tool.trim(label);
		if(label&&PG.Tool.trim(label)!=''){
			this.title.style.visibility="inherit";
			this._se_infowin_close.style.backgroundColor='#f9f9f9';
			this.content.style.padding='5px 7px 0 10px';
			this.content.style.marginTop='0px';
			this.title_ctx3.innerHTML='';
			if(typeof(label)=="object")
			{
				this.title_ctx3.appendChild(this.intercept(label));
			}
			else
			{        
				var div=document.createElement("DIV");
				div.innerHTML=label;			
				this.title_ctx3.appendChild(this.intercept(div));	
			}
			if(this.created){this.changeInfoWin();}
			if(PG.Tool.isInDocument(this.div)){this.reDraw(true);}
		}else{
			this.title.style.visibility="hidden";
			this._se_infowin_close.style.backgroundColor='';
			this.content.style.padding='0 10px 0 10px';
			this.content.style.marginTop='-10px';
		}		
	};

	/**
		標題字符截取	--徐金評新增

		_node	:節點
	*/
	PG.WindowEntity.prototype.intercept = function(_node){
		var text=null;//內容
		var node=_node;
		var _n=null;
		while(true){
			if(node.childNodes.length==1&&node.childNodes[0].nodeType==3){//文本節點類型
				_n=node.childNodes[0];
				text=_n.nodeValue;
				break;
		    }else if(node.childNodes.length==1&&node.childNodes[0].nodeType==1){//只有一個子節點
					node = node.childNodes[0];
			}else{
				break;
			}				
		}
		var intec = false;
		if(text){	
			var bytes=this.getBytesCount(text);
			//以前15個字符為基礎,每次加1計算字符長度
			if(bytes>this.maxTitleLength){	
				var chinese=Math.floor(this.maxTitleLength/2);//最大的中文數目
				var count=1;
				var c=chinese+count;
				bytes=bytes+this.getBytesCount(text.charAt(c));
				while(true){
					if(c<text.length){
						bytes=bytes+this.getBytesCount(text.charAt(c));
						if(bytes>=this.maxTitleLength){break;}else{c++;}					
					}else{
						break;
					}	
				}
				if(bytes>this.maxTitleLength){c=c-1;}			
				intec = true;
				text = text.substring(0,c);
			}
			//計算需要的最小寬度---僅在用戶沒有設置寬度的情況下有效
			if(!this._set_width){
				var l = text.length - 6;
				var minwidth = parseInt(this.content.style.minWidth);
				var width = (l>0)?(minwidth+l*14):minwidth;
				if(width > minwidth){
					this.size[0] = width + 3;
				}
			}		
			_n.nodeValue=text+(intec?'...':'');
		}		
		return _node;
	};

	/**
		計算字符的字節數	--徐金評新增

		str	:字符
	*/
	PG.WindowEntity.prototype.getBytesCount = function(str){
		var bytesCount = 0; 
		var reg = new RegExp("^[\u0000-\u00ff]$","g");
		if (str != null) 
		{ 
			for (var i = 0; i < str.length; i++) 
			{ 
				var c = str.charAt(i); 
				if (reg.test(c)) 
				{ 
					bytesCount += 1; 
				} 
				else 
				{ 
					bytesCount += 2; 
				} 
			} 
		} 
		return bytesCount; 
	};

	/**
		選擇標籤		

		這個函數修改了,如有問題,請參考以前版本---徐金評
	*/
	PG.WindowEntity.prototype.createTabs=function(tabs){
		var tNum = tabs.length;
		if(tNum==0)return;
		var temp = document.createElement("div");
		temp.style.position = "absolute";
		temp.style.left = "-2000px";
		document.body.appendChild(temp);
		
		var str=[];
		var sty = "margin:0px;list-style:none;height:19px;float: left; padding-top: 5px; padding-left: 4px; padding-right: 4px; border-bottom: 1px solid rgb(129, 128, 127); height: 19px; line-height: 19px;cursor:pointer;";
		str.push('<div>');
		str.push("	<ul style='padding:0px;margin:0px;font-size:12px;overflow:hidden;'>");
		str.push("		<li style='width:20px;"+sty+"'></li>");		
		for(var i=0;i<tNum;i++){
		str.push("		<li style='"+sty+"'></li>");
		}
		str.push("		<li style='width:20px;margin-left:1px;_margin-left:-3px;list-style:none;height:19px;float: left; padding-top: 5px; padding-left: 4px; padding-right: 4px; border-bottom: 1px solid rgb(129, 128, 127); height: 19px; line-height: 19px;cursor:pointer;'></li>");
		str.push('	</ul>');
		str.push("	<div style='clear:left;padding:5px;font-size:12px;'></div>");
		str.push('</div>');
		temp.innerHTML = str.join('');
		
//		確定的li和div
		for(var i=0;i<tNum;i++){
			var _n = tabs[i];
			_n._labelNode = temp.getElementsByTagName("li")[i+1];
			_n._contentNode  = temp.getElementsByTagName("div")[1];
			PG.Event.bind(_n._labelNode,"click",this,this.onTabLabelClk(i));
		}
		
		this._tab_title = temp.getElementsByTagName("ul")[0];
		this._tab_content = temp.getElementsByTagName("div")[1];
		
		var w = 0;
		for(var i=0;i<tNum;i++){
			var _n = tabs[i];
			_n._labelNode.innerHTML = _n.getLabel();
			var _c = _n.getContent();
			typeof(_c)!="object"?_n._contentNode.innerHTML = _c:_n._contentNode.appendChild(_c);
			w = Math.max(w,this._tab_content.offsetWidth);
			if(i == tNum-1){
				_n._contentNode.innerHTML = "";
			}
		}
		w = Math.max(w,this._tab_title.offsetWidth);
		temp.firstChild.style.width = w + 2 + "px";
		
		var last_li = temp.getElementsByTagName("li")[temp.getElementsByTagName("li").length-1];
		last_li.style.marginLeft = last_li.offsetLeft + "px"; 
		last_li.style.styleFloat = "none";
		last_li.style.cssFloat = "none";
		last_li.style.width = "auto";
		
		this.onTabLabelClk(0).call(this);		
		return temp.firstChild;		
	};

	/**
		選擇指定的標籤.它的效果等同於點擊相應標籤	
	*/
	PG.WindowEntity.prototype.SelectTab = function(tab){
		if(this._label){
			for(var i=0;i<this._label.length;i++){
				if(this._label[i]==tab){
					this.onTabLabelClk(i).call(this);
					break;
				}
			}
		}
	};

	/**
		單擊選項卡時觸發 		
	*/
	PG.WindowEntity.prototype.onTabLabelClk = function(i){
		return function(){
			if(this.lastSel){
				this.lastSel._labelNode.style.border = 'none';
				this.lastSel._labelNode.style.borderBottom = "1px solid #81807F";
				this.lastSel._focus = false;
			}
			this.lastSel = this._label[i];
			this.lastSel._labelNode.style.border = '1px solid #81807F';
			this.lastSel._labelNode.style.borderBottom = "none";
			this.lastSel._focus = true;
			
			var _con = this.lastSel.getContent();
			if(typeof(_con)=="object")
			{
				this.lastSel.innerHTML = "";
				this.lastSel._contentNode.appendChild( _con );
			}
			else
			{
				this.lastSel._contentNode.innerHTML= _con;
			}
		}
	};

	/**
		返回當前選中的標籤	
	*/
	PG.WindowEntity.prototype.GetCurrentTab=function()
	{
		return this.lastSel;
	};

	/**
		關閉信息浮窗		
	*/
	PG.WindowEntity.prototype.CloseWindow=function()
	{
		if(!this.map){return;}
		PG.Event.trigger(this,"OnClose",[]);
		this.map.RemoveEntity( this );
	};

	/**
		信息浮窗是否關閉		
	*/
	PG.WindowEntity.prototype.isClose=function(){
		return !!this.map;
	};

	/**
		設置信息浮窗的寬度,如果信息浮窗的內容超過顯示範圍,信息浮窗會自動適應大小		
	*/
	PG.WindowEntity.prototype.SetWidth=function( w )
	{
		this.size[0] =parseInt(w);
		this._set_width = true;
		if(PG.Tool.isInDocument(this.div)){this.reDraw(true);}
	};

	/**
		設置信息浮窗的高度,如果信息浮窗的內容超過顯示範圍,信息浮窗會自動適應大小		
	*/
	PG.WindowEntity.prototype.SetHeight = function( h )
	{
		this.size[1] =parseInt(h);
		if(PG.Tool.isInDocument(this.div)){this.reDraw(true);}
	};

	/**
		設置信息浮窗顯示時向右下角偏移量(像素)	
	*/
	PG.WindowEntity.prototype.SetOffset = function(offset){
		this.offset=offset?offset: new PG.Point(0,0);
		this.anchorObj = null;
		this.reDraw(true);
	};
	
	/**
		設置信息浮窗所指向的地理位置坐標		
	*/
	PG.WindowEntity.prototype.SetPoint = function( obj,offset)
	{
		if(offset&&PG.Tool.isArray(offset)){
			offset = new PG.Point(offset[0],offset[1]);
		}
		if(obj.getPoint)
		{
			this.point=obj.getPoint();
			this.anchorObj=obj;
		}
		else
		{
			this.point = obj;
			this.anchorObj=null;
		}
		this.offset=offset?offset: new PG.Point(0,0);
		this.reDraw( true);
	};

	/**
		返回信息浮窗所指向的地理位置坐標		
	*/
	PG.WindowEntity.prototype.GetPoint = function()
	{
		return this.point?this.point:this.anchorObj.getPoint();
	};

	/**
		設置信息浮窗在用戶鼠標移開後自動關閉		
	*/
	PG.WindowEntity.prototype.CloseWindowOnMouseOut = function()
	{
		if(!this.mouseMoveListener){this.mouseMoveListener=PG.Event.bind(document,"mousemove",this,this.onMouseMove);}
	};

	/**
		鼠標移動時觸發		
	*/
	PG.WindowEntity.prototype.onMouseMove=function(e)
	{
		if(!PG.Tool.isInDocument(this.div))
		{
			return;
		}
		var mouse = PG.Tool.getEventPosition(e,this.map.container);
		var position = PG.Tool.getPageOffset(this.div );
		var container = PG.Tool.getPageOffset(this.map.container );
		position = [position[0]-container[0],position[1]-container[1]];
		if(this.point.icon )
		{//如果是marker
			var markerSize=this.point.icon.GetSize();
			if(mouse[0]<position[0]-markerSize[0] || mouse[0]>position[0]+this.asize[0]+markerSize[0] || mouse[1]<position[1]- markerSize[1] || mouse[1]>position[1]+this.asize[1] + markerSize[1] )
			{
				this.CloseWindow();
			}
		}
		else if( this.point.getMercatorLatitude )
		{//如果是point
			if( mouse[0]<position[0] || mouse[0]>position[0]+this.asize[0] || mouse[1]<position[1] || mouse[1]>position[1]+this.asize[1]+this.asize[1])
			{
				this.CloseWindow();
			}
		}
	};

	/**
		取消信息浮窗在用戶鼠標移開後自動關閉的設置		
	*/
	PG.WindowEntity.prototype.DisableCloseWindowOnMouseOut = function()
	{
		PG.Event.removeListener(this.mouseMoveListener);
		this.mouseMoveListener=null;
	};

	/**
		設置陰影		
	*/
	PG.WindowEntity.prototype.SetShadow= function(){
		this.winShadow=new PG.MapShadow();
		this.winShadow.bindInfoWin(this);
	};

	/**
		設置濾鏡或者非濾鏡		
	*/
	PG.WindowEntity.setPngSrc=function(obj,imgsrc){
		//把PG.Tool.browserInfo().isIE6改为PG.Tool.browserInfo().isIE
		//出现两个箭头那是因为在ie下还用到了AlphaImageLoader, 濾鏡
		if(PG.Tool.browserInfo().isIE){
			//obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgsrc+"',sizingMethod='crop')";
			//obj.style.overflow="hidden";
			obj.src=window.PG._map_maskBackgroundURL;
		}else{
			obj.src=imgsrc;
		}
	};
	
	/** 
		PG.WindowEntityTab,此類的實例數組可以作為 tabs 參數傳遞到方法 PG.WindowEntity.setLabel中.
		如果數組包含多個元素,則將顯示帶有標籤的信息窗口.
		每個 WindowEntityTab 對象都包含兩個項目:content 定義選中標籤時信息窗口的內容,label 定義標籤的標籤.
		這些屬性將作為參數傳遞到構造函數中.
		對於 PG.PointOverLay.openInfoWinElement() 方法,content 為 DOM 節點.
		對於 PG.PointOverLay.openInfoWinHtml() 方法,content 為包含 HTML 文字的字符串.		
	*/
	function WindowEntityTab(label,content,focus){
		this._label = label;
		this._content = content;
		this.focus = !!focus;
		this._labelNode = null;
		this._contentNode = null;
	}
	PG.WindowEntityTab = WindowEntityTab;

	/**
		暫不考慮實現set功能,需要刷新infowin,google也沒實現
	*/
	PG.WindowEntityTab.prototype.getLabel = function(){
		return this._label;
	};

	/**
		獲得選項卡內容		
	*/
	PG.WindowEntityTab.prototype.getContent = function(){
		return this._content;
	};
	
	window.PG.WindowEntity = PG.WindowEntity;
	window.PG.WindowEntityTab = PG.WindowEntityTab;
}
MapNSWindowEntity();