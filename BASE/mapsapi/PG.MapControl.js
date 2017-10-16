/**
	本文件是JS API之中的PG.MapControl類
	By K_Reverter
*/
function MapNS()
{
	function MapControl(type,padBottom)
	{
		PG.Tool.inherit(this,PG.Control);
		//初始化參數
		type=(type==false)?1:((typeof(type)=='number')?type:0);
		this.activeXImg=window.PG._IMG_PATH;
		this.imgFileType=".png";		
		
		this.gap = 2;
		this._up_size = [17,17];

		this.tipSize=window.PG._smc_tipSize?window.PG._smc_tipSize:[51,17,0,-3,6,2];
		this.tipText=window.PG._smc_tipText;
		this.tipDivs = [];

		//建立控件層
		this.div =PG.Tool.createDiv(1,[10,10]);
		PG.Tool.setUnSelectable(this.div);	
		
		this.type=type;
		this._OTP = this.type;
		this._pbt = parseInt(padBottom)||0;		
		this.bInfo = PG.Tool.browserInfo();		

		//骨頭棒圖片
		var tp = this.activeXImg+"mapcontrols2"+this.imgFileType;
		var tip_url = this.activeXImg+"sprite-control.gif";
		
		this.zi_obj = {size:[17,17],url:tp,bgoffset:[-20,-65],isPng:false};//放大按鈕
		this.zo_obj = {size:[17,17],url:tp,bgoffset:[-20,-365],isPng:false};//縮小按鈕
		this.zr_obj = {size:[17,17],url:tp,bgoffset:[-20,-20],isPng:false};//刷新按鈕
		this.up_obj = {size:[17,17],url:tp,bgoffset:[-20,0],isPng:false,offsetX:0};//上移動按鈕
		this.rt_obj = {size:[17,17],url:tp,bgoffset:[-40,-20],isPng:false};//右移動按鈕
		this.dn_obj = {size:[17,17],url:tp,bgoffset:[-20,-40],isPng:false,offsetX:0};//下移動按鈕
		this.lt_obj = {size:[17,17],url:tp,bgoffset:[-0,-20],isPng:false};//左移動按鈕
		this.zc_obj = {size:[17,9],url:tp,bgoffset:[-1,-385],isPng:false,offsetX:0};//zoom滑動按鈕
		this.zd_obj = {size:[17,8.1],url:tp,bgoffset:[-20,-86],isPng:true,offsetX:0}; //zoom滑動條
		this.tip_obj = {size:this.tipSize,url:tip_url,bgoffset:[-102, 0],isPng:false};//tip
	}
	PG.MapControl = MapControl;

	/**
		初始化		
	*/
	PG.MapControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.initDom();
		
		this.map=map;
		this.map._MapControl=this;

		//設置cursor
		this.onMapZoom();
		this.mzl=PG.Event.bind(map,"OnZoom",this,this.onMapZoom);
		
		//添加監聽地圖大小改變的事件,以改變控件位置
		if(this._OTP==4||this._OTP==0){
			this.mrz = PG.Event.bind(map,"OnResize",this,this.onMRZ);
			var _ths = this;
			setTimeout(function(){
					_ths.onMRZ(_ths.map.GetWindow());
				},0);
		}

		if(this.type==0 || this.type==4)
		{
			this.setCursor();
			this.zoomDiv.style.display="";
			var zoomLength=map.zoomLevels.length*this.zd_obj.size[1];
			this.zoomDiv.style.height=zoomLength+"px";
			var top=(this.type==0)?(this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]+zoomLength):(this.zo_obj.size[1]+zoomLength);
			this.zoomOut.style.top=top+"px";
			this.mszl=PG.Event.bind(map,"slidezoom",this,this.setCursor);
			var tipSize=this.tip_obj.size;
			this.initTip();
			//整個骨頭棒的大小	
			this.btnSize = [this.lt_obj.size[0]+this.zr_obj.size[0]+this.rt_obj.size[0]+this.gap*2,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]+this.zo_obj.size[1]];
			this.size=[this.btnSize[0],this.btnSize[1]+zoomLength];
			if(this.tipText)//如果顯示了tips,則tips可能需要影響整體大小
			{
				var addWidth=tipSize[2]+tipSize[0]-this.gap-this.lt_obj.size[0];
				if(addWidth>0){this.size[0]+=addWidth;}
			}
			PG.Tool.SetSize(this.div,this.size);
		}
	};	

	/**
		初始化		
	*/
	PG.MapControl.prototype.initDom = function(){
		var type = this.type;
		//創建按鈕button
		this.onClickCall=PG.Event.getCallback(this,this.onButtonClick);
		if(type>=2 && type<=4)//如果是只有縮放等級按鈕的模式
		{
			this.zoomIn=this.addControlImage(this.zi_obj.size,[0,0].concat(this.zi_obj.bgoffset),"放大","zoomin",this.zi_obj.url,this.zi_obj.isPng);
			this.zoomOut=this.addControlImage(this.zo_obj.size,[(type==3)?this.zi_obj.size[0]:0,(type==3)?0:this.zi_obj.size[1]].concat(this.zo_obj.bgoffset),"縮小","zoomout",this.zo_obj.url,this.zo_obj.isPng);
		}
		else if(type<2)
		{
			this.zoomIn=this.addControlImage(this.zi_obj.size,[this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3].concat(this.zi_obj.bgoffset),"放大","zoomin",this.zi_obj.url,this.zi_obj.isPng);
			this.zoomOut=this.addControlImage(this.zo_obj.size,[this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]].concat(this.zo_obj.bgoffset),"縮小","zoomout",this.zo_obj.url,this.zo_obj.isPng);
			this.zoomRefresh=this.addControlImage(this.zr_obj.size,[this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.gap].concat(this.zr_obj.bgoffset),"返回到最初視圖","refresh",this.zr_obj.url,this.zr_obj.isPng);
			this._up=this.addControlImage(this.up_obj.size,[this.lt_obj.size[0]+this.up_obj.offsetX+this.gap,0].concat(this.up_obj.bgoffset),"上移","up",this.up_obj.url,this.up_obj.isPng);
			this._right=this.addControlImage(this.rt_obj.size,[this.lt_obj.size[0]+this.zr_obj.size[0]+this.gap*2,this.up_obj.size[1]+this.gap].concat(this.rt_obj.bgoffset),"右移","right",this.rt_obj.url,this.rt_obj.isPng);
			this._down=this.addControlImage(this.dn_obj.size,[this.lt_obj.size[0]+this.dn_obj.offsetX+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.gap*2].concat(this.dn_obj.bgoffset),"下移","down",this.dn_obj.url,this.dn_obj.isPng);
			this._left=this.addControlImage(this.lt_obj.size,[0,this.up_obj.size[1]+this.gap].concat(this.lt_obj.bgoffset),"左移","left",this.lt_obj.url,this.lt_obj.isPng);
		}
		//創建縮放等級條
		if(type==0 || type==4)
		{			
			var position=(type==0)?([this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]]):([0,this.zi_obj.size[1]]);
			var zoomDiv=PG.Tool.createDiv(1,position);
			zoomDiv.style.display="none";
			if(this.bInfo.isIE6 && this.zd_obj.isPng)
			{
				var inZoomd = document.createElement("div");
				PG.Tool.SetSize(inZoomd,[1000,0]);
				inZoomd.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image,src="+(this.activeXImg+"mapcontrols2"+this.imgFileType)+")";
				inZoomd.style.position = "relative";
				inZoomd.style.left = this.zd_obj.bgoffset[0]+"px";
				inZoomd.style.top = this.zd_obj.bgoffset[1]+"px";
				zoomDiv.style.overflow = "hidden";
				zoomDiv.appendChild(inZoomd);
			}
			else
			{
				zoomDiv.style.backgroundImage="url("+this.activeXImg+"mapcontrols2"+this.imgFileType+")";
				zoomDiv.style.backgroundPosition= this.zd_obj.bgoffset[0]+"px "+this.zd_obj.bgoffset[1]+"px";
			}

			zoomDiv.style.backgroundRepeat = "no-repeat";
			PG.Tool.SetSize(zoomDiv,[this.zd_obj.size[0],0]);
			PG.Tool.setUnSelectable(zoomDiv);
			this.div.appendChild(zoomDiv);

			var zoomCursor=this.addControlImage(this.zc_obj.size,[this.zc_obj.offsetX,0].concat(this.zc_obj.bgoffset),"","a_f",this.zc_obj.url,this.zc_obj.isPng,true,zoomDiv);
			
			PG.Event.bind(zoomCursor,this.bInfo.isMwk?"touchstart":"mousedown",this,this.onCursorMousedown);
			PG.Tool.setCursorStyle(zoomDiv,"hand");
			PG.Event.bind(zoomDiv,this.bInfo.isMwk?"touchstart":"mousedown",this,PG.Event.cancelBubble);
			PG.Event.bind(zoomDiv,this.bInfo.isMwk?"touchstart":"click",this,this.onZoomTableClick);
			PG.Event.bind(zoomDiv,this.bInfo.isMwk?"touchstart":"mouseover",this,this.onZoomDivMouseOver);
			this.zoomCursor=zoomCursor;
			this.zoomDiv=zoomDiv;
			PG.Event.bind(this.zoomIn,this.bInfo.isMwk?"touchstart":"mouseover",this,this.onZoomDivMouseOver);
			PG.Event.bind(this.zoomOut,this.bInfo.isMwk?"touchstart":"mouseover",this,this.onZoomDivMouseOver);
		}
	};
	
	/**
		初始化級別提示文字
	*/
	PG.MapControl.prototype.initTip = function()
	{
		if(this.tipText)		//如果需要顯示提示文字
		{		
			//用戶指定X偏移
			var xofs = this.zd_obj.offsetX;
			var type = this.type;
			var tipSize=this.tip_obj.size;
			var map = this.map;
			var position=(type==0)?([this.lt_obj.size[0]+this.zd_obj.size[0]+xofs+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*5]):([this.zd_obj.size[0]+xofs,0]);
			this.tipsDiv=PG.Tool.createDiv(1,position);//創建顯示tips的層
			
			this.tipsDiv.style.display="none";
			//this.tipsDiv.style.border="solid 2px red";
			this.div.appendChild(this.tipsDiv);
			var ie6_png = this.bInfo.isIE6 && this.tip_obj.isPng;
			if(!ie6_png){PG.Tool.setOpacity(this.tipsDiv,0.8);}

			PG.Event.bind(this.tipsDiv,this.bInfo.isMwk?"touchstart":"mouseover",this,this.onZoomDivMouseOver);
			PG.Event.addListener(this.tipsDiv,"dblclick",PG.Event.cancelBubble);

			var tipsBackDiv=PG.Tool.createDiv(1,[0,0]);
			PG.Tool.SetSize(tipsBackDiv,["100%","100%"]);
			this.tipsDiv.appendChild(tipsBackDiv);

			//window.PG._smc_tipSize=[51,17,0,-3,6,2];
			//tipSize[0]和tipSize[1]為按鈕的寬度和高度,tipSize[2]可能是左邊間隙(left),
			//tipSize[3]為圖片偏移
			//tipSize[4],tipSize[5]為文字的距離
			//相距與外部div的margin	[tipSize[0]-tipSize[5],tipSize[1]-tipSize[4]]
			PG.Tool.SetSize(this.tipsDiv,[0+tipSize[2]+tipSize[0],(map.zoomLevels.length)*this.zd_obj.size[1]+this.zi_obj.size[1]+this.zo_obj.size[1]+tipSize[3]+tipSize[1]]);
			
			//創建tip(18:"實景",15:"街道",9:"城市",5:"全國",1:"世界")
			for(var i in this.tipText)
			{
				var z=parseInt(i);
				if(isNaN(z)){continue;}
				var index=map.getZoomIndex(z);
				if(index<0){continue;}
				
				var tipDiv=PG.Tool.createDiv(1,[0+tipSize[2],this.zi_obj.size[1]+(map.zoomLevels.length-1-index)*this.zd_obj.size[1]+tipSize[3]]);
				PG.Tool.setCursorStyle(tipDiv,"hand");
				PG.Tool.SetSize(tipDiv,[tipSize[0],tipSize[1]]);

				//設置背景圖片 
				var ofsbg = this.tip_obj.bgoffset;
				if(ie6_png){
					var inimg = document.createElement("div");
					inimg.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image,src="+this.tip_obj.url+")";
					tipDiv.appendChild(inimg);
					inimg.style.position = "relative";
					inimg.style.left = ofsbg[0]+"px";
					inimg.style.top = ofsbg[1]+"px";
					PG.Tool.SetSize(inimg,[1000,1000]);
					PG.Event.bind(inimg,"mouseout",this,PG.Event.cancelBubble);
				}else{
					tipDiv.style.backgroundImage="url("+this.tip_obj.url+")";
					tipDiv.style.backgroundPosition = ofsbg[0]+"px "+ofsbg[1]+"px";
				}
				PG.Event.addListener(tipDiv,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.returnTrue);
				PG.Event.bind(tipDiv,this.bInfo.isMwk?"touchend":"mouseup",this,this.getZoomFunction(z));
				this.tipsDiv.appendChild(tipDiv);
				
				//設置級別提示文字
				var span=PG.Tool.createDiv(1,[tipSize[4],tipSize[5]]);
				PG.Tool.SetSize(span,[tipSize[0]-tipSize[5],tipSize[1]-tipSize[4]]);
				span.innerHTML=this.tipText[i];
				span.align="center";
				span.style.fontSize="12px";
				span.style.paddingTop="1px";
				span.style.lineHeight="100%";
				tipDiv.appendChild(span);
				PG.Tool.setUnSelectable(span);
				this.tipDivs.push({index:i,tipDiv:tipDiv});
			}
		}
		
	};

	/**
		設置類型		
	*/
	PG.MapControl.prototype.setType = function(type){
		this._OTP = this.type;
		if(!this.map){
			return;
		}
		var tpNode;
		while(tpNode = this.div.firstChild){
			if(tpNode.nodeType==3){
				this.div.removeChild(tpNode);
				continue;
			}else{
				PG.Event.deposeNode(tpNode);
			}
		}
		var tempMap = this.map;
		this.map.RemoveControl(this);
		tempMap.AddControl(this);
	};
	
	/**
		獲得將地圖定位到指定級別的函數句柄		
	*/
	PG.MapControl.prototype.getZoomFunction=function(zoom)
	{
		return function(){this.map.zoomTo(zoom);};
	};
	
	/**
		設置控件按鈕(放大,縮小,左,右,上,下,滑動)		
	*/
	PG.MapControl.prototype.addControlImage=function(size,position,title,name,src,isPng,flag,parent)
	{
		var img=document.createElement("div");
		if(this.bInfo.isIE6 && isPng)
		{
			var inimg = document.createElement("div");
			inimg.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image,src="+src+")";
			img.appendChild(inimg);
			inimg.style.position = "relative";
			inimg.style.left = position[2]+"px";
			inimg.style.top = position[3]+"px";
			PG.Tool.SetSize(inimg,size);
			inimg.name=name;
		}
		else
		{
			if(position.length>2){
				img.style.background = 'url('+src+') '+position[2]+'px '+position[3]+'px';
			}else{
				img.style.background = 'url('+src+')';
			}
		}
		PG.Tool.SetSize(img,size);
		img.style.position="absolute";
		img.style.overflow = "hidden";
		PG.Tool.setPosition(img,position);
		img.title=title;
		img.name=name;
		PG.Tool.setUnSelectable(img);
		PG.Event.addListener(img,"dblclick",PG.Event.cancelBubble);
		if(!flag){PG.Event.addListener(img,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.cancelBubble);}
		PG.Tool.setCursorStyle(img,"hand");
		PG.Event.addListener(img,this.bInfo.isMwk?"touchstart":"click",this.onClickCall);
		parent=parent?parent:this.div;
		parent.appendChild(img);
		return img;
	};

	/**
		鼠標滑過縮放控制條時執行的函數	
		
		顯示tip
	*/
	PG.MapControl.prototype.onZoomDivMouseOver=function(e)
	{
		this.tipsDiv.style.display="";
		this.zdmOut=PG.Event.bind(document,this.bInfo.isMwk?"touchend":"mouseout",this,this.onZoomDivMouseOut);
	};

	/**
		鼠標滑出縮放控制條時執行的函數		

		隱藏tip
	*/
	PG.MapControl.prototype.onZoomDivMouseOut=function(e)
	{
		this.tipsDiv.style.display="none";
	};

	/**
		點擊控件按鈕(放大,縮小,左,右,上,下,滑動)時執行的函數			
	*/
	PG.MapControl.prototype.onButtonClick=function(e)
	{
		if(!e.target){e.target=e.srcElement;}
		PG.Event.cancelBubble(e);
		var viewSize=this.map.GetWindow();
		switch(e.target.name)
		{
			case "zoomin":this.map.ZoomIn();break;
			case "zoomout":this.map.ZoomOut();break;
			case "refresh":this.map.RestoreViewport();break;
			case "up":this.map.move([0,-viewSize[1]/2]);break;
			case "right":this.map.move([viewSize[0]/2,0]);break;
			case "down":this.map.move([0,viewSize[1]/2]);break;
			case "left":this.map.move([-viewSize[0]/2,0]);break;
		}
	};

	/**
		點擊縮放棒時執行的函數			
	*/
	PG.MapControl.prototype.onZoomTableClick=function(e)
	{
		PG.Event.cancelBubble(e);
		var position=PG.Tool.getEventPosition(e,this.zoomDiv);
		this.map.zoomTo(this.map.zoomLevels[this.map.zoomLevels.length-parseInt(position[1]/this.zd_obj.size[1])-1]);
	};

	/**
		鼠標按下zoom滑動按鈕時觸發的函數		
	*/
	PG.MapControl.prototype.onCursorMousedown=function(e)
	{
		PG.Event.cancelBubble(e);
		this.cursorMouseUpListener=PG.Event.bind(document,this.bInfo.isMwk?"touchend":"mouseup",this,this.onCursorMouseup);
		this.cursorMouseMoveListener=PG.Event.bind(document,this.bInfo.isMwk?"touchmove":"mousemove",this,this.onCursorMousemove);
		this.draggingPoint =parseInt(this.zoomCursor.style.top)-e.clientY;
		this.enableDrag = true;
		this.isDragging = true;
	};

	/**
		鼠標移動zoom滑動按鈕時觸發的函數

		計算縮放的級別
	*/
	PG.MapControl.prototype.onCursorMousemove=function(e)
	{
		PG.Event.cancelBubble(e);
		var buttonHeight=this.zd_obj.size[1];
		if(this.enableDrag && this.isDragging)
		{
			this.enableDrag=false;
			window.setTimeout(PG.Event.getCallback(this,function(){if(this.isDragging){this.enableDrag=true;}}),30);
			var topY=this.draggingPoint+e.clientY;
			if(topY>0 && topY<(this.map.zoomLevels.length-0.5)*buttonHeight)
			{
				this.zoomCursor.style.top =topY+"px";
				if(this.bInfo.isIE && this.map.slideMaxZoom>0)
				{
					var zoom=this.map.zoomLevels.length-parseInt(this.zoomCursor.style.top)/buttonHeight;					
					this.zoomTo(zoom-1);//是根據index縮放的,所以要減一	
				}
			}
		}
	};

	/**
		鼠標移動zoom滑動按鈕後放開時觸發的函數

		地圖縮放到zoom滑動按鈕所處的級別
	*/
	PG.MapControl.prototype.onCursorMouseup = function(e)
	{
		PG.Event.removeListener(this.cursorMouseMoveListener);
		this.cursorMouseMoveListener=null;
		PG.Event.removeListener(this.cursorMouseUpListener);
		this.cursorMouseUpListener=null;
		var zoom=Math.round(parseInt(this.zoomCursor.style.top)/this.zd_obj.size[1]);
		this.map.zoomTo(this.map.zoomLevels.length-this.map.zoomLevels[zoom]+1);
		this.setCursor();
		this.enableDrag = false;
		this.isDragging = false;
	};

	/**
		縮放到zoom級別 		
	*/
	PG.MapControl.prototype.zoomTo=function(zoom)
	{
		if(zoom<1 || zoom>this.map.zoomLevels.length-1){return;}
		this.map.zoomToByStyle(zoom);
	};

	/**
		返回容器		
	*/
	PG.MapControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		設置縮放按鈕cursor		
	*/
	PG.MapControl.prototype.onMapZoom=function()
	{
		PG.Tool.setCursorStyle(this.zoomOut,this.map.zoomIndex>0?"pointer":"not-allowed,pointer");
		PG.Tool.setCursorStyle(this.zoomIn,this.map.zoomIndex<this.map.zoomLevels.length-1?"pointer":"not-allowed,pointer");
	};

	/**
		地圖大小改變時執行		
	*/
	PG.MapControl.prototype.onMRZ = function(vs){
		var point=[0,0];
		var a= this.zoomOut;
		while(a && a.offsetParent)
		{
			point[0]+=a.offsetLeft;
			point[1]+=a.offsetTop;
			if(a.offsetParent == this.map.GetContainer()){
				break;
			}
			a=a.offsetParent;
		}
		if(!this._gth)
			this._gth = point[1] + this.zoomOut.offsetHeight + this._pbt;
		
		
		if(this._OTP==0||this._OTP==4){
			if(this._gth>vs[1]&&!this._is_s){
				this._is_s = true;
				this._o_h = this.zoomDiv.offsetHeight;
				this.zoomDiv.style.display = "none";
				this.zoomOut.style.marginTop = - this._o_h +"px";
			}else if(this._gth<vs[1]&&this._is_s){
				this._is_s = false;
				this.zoomDiv.style.display = "";
				this.zoomOut.style.marginTop = "0px";
			}
		}
	};

	/**
		設置滑動按鈕位置		
	*/
	PG.MapControl.prototype.setCursor=function(zoomIndex)
	{
		var zoomIndex=((typeof(zoomIndex)=="number")?zoomIndex:(typeof(this.map.zoomIndex)=="number")?this.map.zoomIndex:1);
		this.zoomCursor.style.top= (this.zd_obj.size[1] * (this.map.zoomLevels.length-zoomIndex-1))+ "px";
	};

	/**
		刪除此控件		
	*/
	PG.MapControl.prototype.remove=function()
	{
		PG.Event.removeListener(this.mszl);
		this.mszl=null;
		PG.Event.removeListener(this.mzl);
		this.mzl=null;
		PG.Event.removeListener(this.cursorMouseUpListener);
		this.cursorMouseUpListener=null;
		PG.Event.removeListener(this.cursorMouseMoveListener);
		this.cursorMouseMoveListener=null;
		if(this.mrz){PG.Event.removeListener(this.mrz);}			
		this.mrz = null;		
		this.map._MapControl=null;
		this.map=null;
	};

	/**
		設置按鈕圖片
		obj:需要設置的對象
		config:圖片信息
	*/
	PG.MapControl.prototype.setImg = function(obj,config){
		var url = config.url;
		var size = config.size;
		var bgoffset = config.bgoffset||[0,0];
		var isPng = !!config.isPng;
		if(!obj) return;
		var cld;
		while(cld = obj.firstChild){
			obj.removeChild(cld);
		}
		if(this.bInfo.isIE6&&isPng){
			obj.style.backgroundImage = '';
			var inimg = document.createElement("div");
			inimg.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=image,src="+url+")";
			obj.appendChild(inimg);
			inimg.style.position = "relative";
			inimg.style.left = bgoffset[0]+"px";
			inimg.style.top = bgoffset[1]+"px";
			PG.Tool.SetSize(inimg,[1000,1000]);
			inimg.name = config.name;
		}else{
			obj.style.backgroundImage = 'url('+url+')';
			obj.style.backgroundPosition = bgoffset[0]+"px "+bgoffset[1]+"px";
		}
	};

	/**
		設置縮小按鈕的圖片	--並不支持png???	
	*/
	PG.MapControl.prototype.SetZoomInImage = function(config){
		if(config.url){this.zi_obj.url = config.url;}			
		if(config.size){this.zi_obj.size = config.size;}			
		if(config.bgoffset){this.zi_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.zi_obj.isPng = config.isPng;}		
		this.zi_obj.name = "zoomin";
		this.setImg(this.zoomIn,this.zi_obj);
		this.calPosBySize();
	};

	/**
		設置縮小按鈕的圖片		
	*/
	PG.MapControl.prototype.SetZoomOutImage=function(config){
		if(config.url){this.zo_obj.url = config.url;}			
		if(config.size){this.zo_obj.size = config.size;}			
		if(config.bgoffset){this.zo_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.zo_obj.isPng = config.isPng;}		
		this.zo_obj.name = "zoomout";
		this.setImg(this.zoomOut,this.zo_obj);
		this.calPosBySize();
	};

	/**
		設置縮放等級條游標的圖片			
	*/
	PG.MapControl.prototype.SetCursorImage = function(config){
		if(config.url){this.zc_obj.url = config.url;}			
		if(config.size){this.zc_obj.size = config.size;}			
		if(config.bgoffset){this.zc_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.zc_obj.isPng = config.isPng;}			
		if(config.offsetX){this.zc_obj.offsetX = config.offsetX;}		
		this.setImg(this.zoomCursor,this.zc_obj);
		this.calPosBySize();
	};

	/**
		設置上移按鈕的圖片		
	*/
	PG.MapControl.prototype.SetControlUpImage = function(config){
		if(config.url){this.up_obj.url = config.url;}			
		if(config.size){this.up_obj.size = config.size;}			
		if(config.bgoffset){this.up_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.up_obj.isPng = config.isPng;}			
		if(config.offsetX){this.up_obj.offsetX = config.offsetX;}		
		this.up_obj.name = "up";
		this.setImg(this._up,this.up_obj);
		this.calPosBySize();
	};

	/**
		設置下移按鈕的圖片		
	*/
	PG.MapControl.prototype.SetControlRightImage = function(config){
		if(config.url){this.rt_obj.url = config.url;}			
		if(config.size){this.rt_obj.size = config.size;}			
		if(config.bgoffset){this.rt_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.rt_obj.isPng = config.isPng;}			
		this.rt_obj.name = "right";
		this.setImg(this._right,this.rt_obj);
		this.calPosBySize();
	};

	/**
		設置下移按鈕的圖片		
	*/
	PG.MapControl.prototype.SetControlDownImage = function(config){
		if(config.url){this.dn_obj.url = config.url;}			
		if(config.size){this.dn_obj.size = config.size;}			
		if(config.bgoffset){this.dn_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.dn_obj.isPng = config.isPng;}			
		if(config.offsetX){this.dn_obj.offsetX = config.offsetX;}			
		this.dn_obj.name = "down";
		this.setImg(this._down,this.dn_obj);
		this.calPosBySize();
	};

	/**
		設置左移按鈕的圖片.		
	*/
	PG.MapControl.prototype.SetControlLeftImage = function(config){
		if(config.url){this.lt_obj.url = config.url;}			
		if(config.size){this.lt_obj.size = config.size;}			
		if(config.bgoffset){this.lt_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.lt_obj.isPng = config.isPng;}		
		this.lt_obj.name = "left";
		this.setImg(this._left,this.lt_obj);
		this.calPosBySize();
	};

	/**
		設置'返回到最初視圖'按鈕的圖片		
	*/
	PG.MapControl.prototype.SetRefreshImage = function(config){
		if(config.url){this.zr_obj.url = config.url;}			
		if(config.size){this.zr_obj.size = config.size;}			
		if(config.bgoffset){this.zr_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.zr_obj.isPng = config.isPng;}		
		this.zr_obj.name = "refresh";
		this.setImg(this.zoomRefresh,this.zr_obj);
		this.calPosBySize();
	};

	/**
		設置縮放等級條的每一個等級顯示的圖片.圖片至少有18個間隔,可以用bgoffset[1]來控制和光標的對齊		
	*/
	PG.MapControl.prototype.SetZoomNodeImage = function(config){
		if(config.url){this.zd_obj.url = config.url;}			
		if(config.size){this.zd_obj.size = config.size;}			
		if(config.bgoffset){this.zd_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.zd_obj.isPng = config.isPng;}			
		if(config.offsetX){this.zd_obj.offsetX = config.offsetX;}		
		this.setImg(this.zoomDiv,this.zd_obj);
		this.calPosBySize();
		this.zoomDiv.appendChild(this.zoomCursor);
		this.setCursor();
	};

	/**
		通過圖片大小計算圖片位置		
	*/
	PG.MapControl.prototype.calPosBySize = function(){
		if(!this.map) return;
		var type = this.type;
		if(type>=2 && type<=4)//如果是只有縮放等級按鈕的模式
		{//設置放大縮小按鈕
			PG.Tool.SetSize(this.zoomIn,this.zi_obj.size);
			PG.Tool.setPosition(this.zoomIn,[0,0]);
			PG.Tool.SetSize(this.zoomOut,this.zo_obj.size);
			PG.Tool.setPosition(this.zoomOut,[(type==3)?this.zi_obj.size[0]:0,(type==3)?0:this.zi_obj.size[1]]);
		}
		else if(type<2)
		{
			PG.Tool.SetSize(this.zoomIn,this.zi_obj.size);
			PG.Tool.SetSize(this.zoomOut,this.zo_obj.size);
			PG.Tool.SetSize(this.zoomRefresh,this.zr_obj.size);
			PG.Tool.SetSize(this._up,this.up_obj.size);
			PG.Tool.SetSize(this._right,this.rt_obj.size);
			PG.Tool.SetSize(this._down,this.dn_obj.size);
			PG.Tool.SetSize(this._left,this.lt_obj.size);
			
			
			PG.Tool.setPosition(this.zoomIn,[this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3]);
			PG.Tool.setPosition(this.zoomOut,[this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]]);
			PG.Tool.setPosition(this.zoomRefresh,[this.lt_obj.size[0]+this.gap,this.up_obj.size[1]+this.gap]);
			PG.Tool.setPosition(this._up,[this.lt_obj.size[0]+this.up_obj.offsetX+this.gap,0]);
			PG.Tool.setPosition(this._right,[this.lt_obj.size[0]+this.zr_obj.size[0]+this.gap*2,this.up_obj.size[1]+this.gap]);
			PG.Tool.setPosition(this._down,[this.lt_obj.size[0]+this.dn_obj.offsetX+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.gap*2]);
			PG.Tool.setPosition(this._left,[0,this.up_obj.size[1]+this.gap]);
		}
		//創建縮放等級條
		if(type==0 || type==4)
		{
			var xofs = this.zd_obj.offsetX;
			var position=(type==0)?([this.lt_obj.size[0]+xofs+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]]):([0+xofs,this.zi_obj.size[1]]);
			PG.Tool.setPosition(this.zoomDiv,position);
			PG.Tool.SetSize(this.zoomDiv,[this.zd_obj.size[0],0]);
			var zoomLength=this.map.zoomLevels.length*this.zd_obj.size[1];
			this.zoomDiv.style.height=zoomLength+"px";
			var top=(this.type==0)?(this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]+zoomLength):(this.zo_obj.size[1]+zoomLength);
			this.zoomOut.style.top=top+"px";
			
			//tip
			var position=(type==0)?([this.lt_obj.size[0]+this.zd_obj.size[0]+xofs+this.gap,this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3]):([this.zd_obj.size[0]+xofs,0]);
			PG.Tool.setPosition(this.tipsDiv,position);
			
			PG.Tool.SetSize(this.zoomCursor, this.zc_obj.size);
			PG.Tool.setPosition(this.zoomCursor, [this.zc_obj.offsetX,0]);
		}
		this.setCursor();
		this.type=this.type;
	};

	/**
		設置tip圖片		
	*/
	PG.MapControl.prototype.setTipNodeImage = function(config){
		
		if(config.url){this.tip_obj.url = config.url;}			
		if(config.size){this.tip_obj.size.splice(0,2,config.size[0],config.size[1]);}			
		if(config.bgoffset){this.tip_obj.bgoffset = config.bgoffset;}			
		if(typeof(config.isPng)!="undefined"){this.tip_obj.isPng = config.isPng;}			
		if(this.map){PG.Event.deposeNode(this.tipsDiv);this.initTip();}
	};

	/**
		銷毀控件		
	*/
	PG.MapControl.prototype.depose=function()
	{
		PG.Event.deposeNode(this.div);
		this.div=null;
	};

	/**
		當骨頭棒的縮放等級改變時重置----徐金評		
	*/
	PG.MapControl.prototype.resetLength = function(){
		if(this.type==0 || this.type==4){
			var zoomLength=this.map.zoomLevels.length*this.zd_obj.size[1];
			this.zoomDiv.style.height=zoomLength+"px";
			var top=(this.type==0)?(this.up_obj.size[1]+this.zr_obj.size[1]+this.dn_obj.size[1]+this.gap*3+this.zi_obj.size[1]+zoomLength):(this.up_obj.size[1]+zoomLength);
			this.zoomOut.style.top=top+"px";
			for(var i=0;i<this.tipDivs.length;i++){
				var index=this.map.getZoomIndex(this.tipDivs[i].index);
				if(index<0){
					if(this.tipDivs[i].tipDiv.parentNode){
						this.tipDivs[i].tipDiv.parentNode.removeChild(this.tipDivs[i].tipDiv);
					}
				}else{
					//ie下display有bug,具體還沒搞清楚
					this.tipsDiv.appendChild(this.tipDivs[i].tipDiv);
					
					this.tipDivs[i].tipDiv.style.top = this.up_obj.size[1]+(this.map.zoomLevels.length-1-index)*this.zd_obj.size[1]+this.tip_obj.size[3]+"px";
				}
			}
			//可能會有[14,15這種情況]
			this.map.zoomIndex = this.map.getZoomIndex(this.map.GetZoomLevel());
			if(!this.map["mapsDiv_"+this.map.zoomIndex]){
				this.map["mapsDiv_"+this.map.zoomIndex]=PG.Tool.createDiv(1);
			}
			this.map.mapLayerDiv.appendChild(this.map["mapsDiv_"+this.map.zoomIndex]);
			
			this.setCursor();
			this.onMapZoom();
		}
	};

	window.PG.MapControl=PG.MapControl;
}
MapNS();