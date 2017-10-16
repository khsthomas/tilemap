/**
	本文件是JS API之中的PG.PointEntity,PG.MarkEntity類
	
*/
function NSPointEntity()
{
	/**
		此類用於標記地圖上的文本,它繼承於PG.Overlay基類	

		obj:  文本標注所在地理位置坐標
		offset:	 文本標注顯示時向右下角偏移量(像素),默認不偏移
		anchorPer:  文本標注顯示時向右下角偏移量(百分比),默認為[0,0.5]
	*/
	function PointEntity(obj,offset,anchorPer)
	{
		PG.Tool.inherit(this,PG.Entity);
		PG.Tool.inherit(this,PG.PointEntity.prototype);
		this.zIndexs=[480,500];
		var div=PG.Tool.createDiv(1,null,this.zIndexs[0]);
		var style=div.style;
		style.border="solid 1px #ADAEAC";
		style.fontSize = "12px";
		style.backgroundColor = "#FFFFD7";
		style.color = "#993300";
		style.padding = "2px";
		div.innerHTML = "JS MAP API";
		this.div=div;
		this.bInfo = PG.Tool.browserInfo();
		this.listeners = [
			PG.Event.bind(div,"mouseover",this,this.onMouseOver),
			PG.Event.bind(div,"mouseout",this,this.onMouseOut),
			PG.Event.bind(div,this.bInfo.isMwk?"touchstart":"mousedown",this,this.onMouseDown),
			PG.Event.bind(div,"resize",this,this.onViewChange)
		];
		if(offset){
			if(PG.Tool.isArray(offset)){
				offset = new PG.Point(offset[0],offset[1]);
			}
		}
		this.offset=offset?offset:new PG.Point(0,0);
		this.anchorPer=anchorPer?anchorPer:[0,0.5];
		if(obj){this.setPoint(obj);}
		this.SetNoWrap(true);

		this.type = window.PG.ENTITY_POINT;
		
		//防止事件泡沫----徐金評添加2012-3-30
		PG.Event.addListener(div,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.returnTrue);
		PG.Event.addListener(div,"selectstart",PG.Event.returnTrue);
		PG.Event.addListener(div,"click",PG.Event.returnTrue);
		PG.Event.addListener(div,"dblclick",PG.Event.returnTrue);
	}
	PG.PointEntity = PointEntity;

	/**
		點擊事件		
	*/
	PG.PointEntity.prototype.onClick=function(e)
	{
		PG.Event.cancelBubble(e);
		var point=(e && this.map)?PG.Tool.getEventPosition(e,this.map.container):this.getPoint();
		var p = new PG.Point(point[0],point[1]);
		PG.Event.trigger(this,"OnClick",[p,e?PG.Tool.getEventButton(e):1]);
	};

	/**
		返回疊加物類型		
	*/
	PG.PointEntity.prototype.GetType = function(){	
		return this.type;
	};

	/**
		鼠標按下時執行		
	*/
	PG.PointEntity.prototype.onMouseDown=function(e)
	{
		var eventTarget=e.target||e.srcElement;
		if(!eventTarget.isCancelBubble){
			PG.Event.cancelBubble(e);
		}else{
			return;
		}
		
		var point=PG.Tool.getEventPosition(e,this.map.container);
		var dragObj={"startTime":(new Date()).getTime(),"startDivPoint":[e.clientX,e.clientY],"mul":PG.Event.bind(document,this.bInfo.isMwk?"touchend":"mouseup",this,this.onMouseUp)};
		this.dragObj=dragObj;
		PG.Event.trigger(this,"OnMouseDown",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)]);
		this._end_p = new PG.Point(point[0],point[1]);	
		if(this.canDrag)
		{
			dragObj.sp=point;
			dragObj.startPoint=this.getPoint();
			dragObj.nCursor=this.div.style.cursor;
			dragObj.dl=PG.Event.bind(document,this.bInfo.isMwk?"touchmove":"mousemove",this,this.onDrag);
			PG.Tool.setCursorStyle(this.div,"move");
			PG.Event.trigger(this,"OnDragStart",[this.getPoint()]);
		}
	};

	/**
		鼠標在標注上釋放時觸發		
	*/
	PG.PointEntity.prototype.onMouseUp=function(e)
	{	
		var eventTarget=e.target||e.srcElement;
		if(!eventTarget.isCancelBubble){
			PG.Event.cancelBubble(e);
		}else{
			return;
		}		
		if(!this.map){return;}
		var point=[0,0];
		if(this.bInfo.isMwk){
			point=this._end_p;
		}else{
			point=PG.Tool.getEventPosition(e,this.map.container);
		}		
		PG.Event.trigger(this,"OnMouseUp",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)]);
		if(!this.dragObj){return;}
		PG.Event.removeListener(this.dragObj.mul);
		if((new Date()).getTime()-this.dragObj.startTime<=500&&(Math.abs(this.dragObj.startDivPoint[0]-e.clientX)<=2&&Math.abs(this.dragObj.startDivPoint[1]-e.clientY)<=2))
		{
			var p = new PG.Point(point[0],point[1]);
			PG.Event.trigger(this.map,"OnClick",[p,PG.Tool.getEventButton(e),this]);
			PG.Event.trigger(this,"OnClick",[p,PG.Tool.getEventButton(e)]);
		}
		this.dragEnd();
	};

	/**
		鼠標拖動標注時持續觸發
	*/
	PG.PointEntity.prototype.onDrag= function(e)
	{
		PG.Event.cancelBubble(e);
		var dragObj=this.dragObj;
		var point=PG.Tool.getEventPosition(e,this.map.container);
		var offset=[point[0]-dragObj.sp[0],point[1]-dragObj.sp[1]];
		var units=this.map.getZoomUnits(this.map.GetZoomLevel(),true);
		var latlng=this.map.MercatorToLngLat(dragObj.startPoint.MercatorLng+offset[0]*units[0],dragObj.startPoint.MercatorLat-offset[1]*units[1]);
		if(this.map.getBoundsLatLng().ContainsPoint(latlng)){this.setPoint(latlng);}
		this._end_p = new PG.Point(point[0],point[0]);
		PG.Event.trigger(this,"OnDrag",[latlng]);
	};

	/**
		鼠標每次拖動標注完成之後觸發		
	*/
	PG.PointEntity.prototype.dragEnd= function()
	{
		var dragObj=this.dragObj;
		if(!dragObj){return;}
		PG.Event.removeListener(dragObj.dl);
		if(dragObj.nCursor){this.div.style.cursor=dragObj.nCursor;}
		this.dragObj=null;
		PG.Event.trigger(this,"OnDragEnd",[this.getPoint()]);
	};
	
	/**
		獲得焦點時觸發	
	*/
	PG.PointEntity.prototype.focus=function()
	{
		if(PG.PointEntity.focus && PG.PointEntity.focus.map){PG.PointEntity.focus.blur();}
		PG.Tool.setZIndex(this.div,this.zIndexs[1]);
		PG.PointEntity.focus=this;
		PG.Event.trigger(this,"focus",[]);
	};

	/**
		失去焦點時觸發	
	*/
	PG.PointEntity.prototype.blur=function()
	{
		PG.Tool.setZIndex(this.div,this.zIndexs[0]);
		if(PG.PointEntity.focus==this){PG.PointEntity.focus=null;}
		PG.Event.trigger(this,"blur",[]);
	};

	/**
		鼠標滑過時觸發	
	*/
	PG.PointEntity.prototype.onMouseOver = function(e)
	{
		var eventTarget=e.target||e.srcElement;
		if(!eventTarget.isCancelBubble){
			PG.Event.cancelBubble(e);
		}else{
			return;
		}
		
		if(!this.map){return}
		var position=PG.Tool.getEventPosition(e,this.map.container);
		if(PG.PointEntity.focus!=this){
			this.focus();
		}
		PG.Event.trigger(this,"OnMouseOver",[new PG.Point(position[0],position[1])]);
	};

	/**
		鼠標移出時觸發	
	*/
	PG.PointEntity.prototype.onMouseOut = function(e)
	{
		var eventTarget=e.target||e.srcElement;
		if(!eventTarget.isCancelBubble){
			PG.Event.cancelBubble(e);
		}else{
			return;
		}
		
		if(!this.map){return;}
		var p = PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnMouseOut",[new PG.Point(p[0],p[1])]);
	};

	/**
		改變時觸發
	*/
	PG.PointEntity.prototype.onViewChange=function(f)
	{
		setTimeout(PG.Event.getCallback(this,function(){this.reDraw(true)}),100);
	};

	/**
		初始化
	*/
	PG.PointEntity.prototype.initialize = function(map)
	{
		if(!this.div || this.map){return false;}
		this.map = map;
		if(!map._MarkerInfoWin)
		{
			map._MarkerInfoWin = new PG.WindowEntity();
			if(PG.PointEntity.infoWinWidth){this.SetWindowWidth(PG.PointEntity.infoWinWidth);}
			if(PG.PointEntity.infoWinHeight){this.SetWindowHeight(PG.PointEntity.infoWinHeight);}
		}
	};

	/**
		移動地圖以確保信息在地圖顯示範圍內---參考PG.InfoWindow的moveToShow實現的

		此方法新添加的---徐金評2012-3-28
	*/
	PG.PointEntity.prototype.AdjustToShow = function(padding)
	{
		padding=padding?padding:5;
		if(!this.map){return;}
		var mapSize=this.map.GetWindow();	
		
		var asize=this.GetSize();
		var winSize=[asize.width,asize.height];
		var point=this.map.slideObject?this.map.slideObject.toPoint:this.map.centerPoint;
		var position=this.map.fromLatLngToContainerPixel(this.GetLngLat());
		var anchor=[0,0];

		var offset=this.offset;
		var left=position[0]+anchor[0]+offset[0];
		var top=position[1]+anchor[1]+offset[1]-winSize[1]/2;
		var right=mapSize[0]-position[0]-(winSize[0]+anchor[0])-offset[0];
		var bottom=mapSize[1]-position[1]-(winSize[1]+anchor[1])-offset[1];
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
			this.map.ZoomPan(this.map.fromContainerPixelToLatLng([mapSize[0]/2+p[0],mapSize[1]/2+p[1]]));
		}
	};

	/**
		返回容器
	*/
	PG.PointEntity.prototype.GetObject = function(){return this.div;};
	
	/**
		重新加載 
	*/
	PG.PointEntity.prototype.reDraw = function( booleans )
	{
		if(!this.map || !booleans || !this.point){return;}
		var size=[this.div.offsetWidth,this.div.offsetHeight];
		if(this.anchorObj)
		{
			var objSize=this.anchorObj.GetSize();
			var objAnchor=this.anchorObj.GetAnchor();
			this.offset=new PG.Point(objSize.width-objAnchor.x,objSize.height/2-objAnchor.y);
		}
		var anchor=this.GetAnchor();	
		var position = this.map.GetRelativeXY(this.point);
		if( position[2])
		{
			if(!PG.Tool.isInDocument(this.div))
			{
				this.map.overlaysDiv.appendChild( this.div );
			}
			PG.Tool.setPosition(this.div,[position[0]-anchor.x,position[1]-anchor.y]);
		}
		else
		{
			if(PG.Tool.isInDocument(this.div))
			{
				this.div.parentNode.removeChild( this.div );
			}
		}
		PG.Event.trigger(this,"OnViewChange",[]);
	};

	/**
		啟動編輯功能
	*/
	PG.PointEntity.prototype.EnableEdit = function(){
		this.enableDrag();
	};

	/**
		禁止編輯功能
	*/
	PG.PointEntity.prototype.DisableEdit = function(){
		this.disableDrag();
	};

	/**
		返回是否可拖動 
	*/
	PG.PointEntity.prototype.IsEditable = function(){
		return !!this.canDrag;
	};

	/**
		啟動拖動功能
	*/
	PG.PointEntity.prototype.enableDrag= function()
	{
		this.canDrag=true;
	};

	/**
		禁止拖動功能
	*/
	PG.PointEntity.prototype.disableDrag= function()
	{
		this.dragEnd();
		this.canDrag=false;
	};

	/**
		得到標注所在的地理位置坐標
	*/
	PG.PointEntity.prototype.GetPoint = function(){
		return this.getPoint();
	};

	/**
		設置標注所在的地理位置坐標
	*/
	PG.PointEntity.prototype.SetPoint = function(ll){
		this.setPoint(ll);
	};

	/**
		得到標注所在的地理位置坐標
	*/
	PG.PointEntity.prototype.getPoint = function()
	{
		var point=this.point;
		return point.icon?point.getPoint():point;
	};

	/**
		設置位置
		//	old
	*/
	PG.PointEntity.prototype.setPoint = function(obj)
	{
		PG.Event.removeListener(this.mvl);
		if(obj&&obj.GetObject)
		{
			this.mvl=PG.Event.bind(obj,"OnViewChange",this,this.onViewChange);
			this.point=obj.point;
			this.anchorObj=obj;
		}
		else{this.point=obj;}
		this.reDraw(true);
	};

	/**
		返回大小
	*/
	PG.PointEntity.prototype.GetSize = function()
	{
		return this.size?this.size:new PG.Size(this.div.offsetWidth,this.div.offsetHeight);
	};

	/**
		
	*/
	PG.PointEntity.prototype.GetAnchor = function()
	{	
		var size=this.GetSize();
		return this.anchor?this.anchor:new PG.Point(size.width*this.anchorPer[0]-this.offset.x,size.height*this.anchorPer[1]-this.offset.y);
	};

	/**
		設置標注顯示時向右下角的偏移量(百分比),設置完後需要調用reDraw(true)才能生效
	*/
	PG.PointEntity.prototype.setAnchorPer = function(anchorper){
		this.anchorPer = anchorper;
		this.reDraw(true);//徐金評添加2012-3-28
	};

	/**
		設置標注顯示時向右下角的偏移量(像素),設置完後需要調用reDraw(true)才能生效
	*/
	PG.PointEntity.prototype.SetOffset = function(ofst){
		if(PG.Tool.isArray(ofst)){
			ofst = new PG.Point(ofst[0],ofst[1]);
		}
		this.offset = ofst;
		this.reDraw(true);//徐金評添加2012-3-28
	};

	/**
		設置內容
	*/
	PG.PointEntity.prototype.SetText = function( html )
	{
		if(html && PG.Event.isHtmlControl(html))
		{
			this.div.innerHTML ="";
			if(html.parentNode){html.parentNode.removeChild(html);}
			this.div.appendChild(html);
		}
		else
		{
			this.div.innerHTML = html;
		}
	};

	/**
		設置容器標題
	*/
	PG.PointEntity.prototype.SetTitle = function(str){
		this.div.title = str;
	};
	
	/**
		設置可見性
	*/
	PG.PointEntity.prototype.setVisible = function( booleans )
	{
		this.div.style.display=booleans?"":"none";
	};

	/**
		返回可見性
	*/
	PG.PointEntity.prototype.getVisible = function()
	{
		return this.div.style.display!="none";
	};

	/**
		設置背景顏色
	*/
	PG.PointEntity.prototype.SetBackgroundColor = function( color )
	{
		this.div.style.backgroundColor= color;
	};

	/**
		設置邊框寬度 
	*/
	PG.PointEntity.prototype.SetBorderLine = function(line)
	{
		this.div.style.borderWidth=PG.Tool.getUserInput(line);
	};

	/**
		設置邊框顏色
	*/
	PG.PointEntity.prototype.SetBorderColor = function( color )
	{
		this.div.style.borderColor=color;
	};

	/**
		設置字體大小
	*/
	PG.PointEntity.prototype.SetFontSize = function( size )
	{
		this.div.style.fontSize =PG.Tool.getUserInput( size );
	};

	/**
		設置字體顏色 
	*/
	PG.PointEntity.prototype.SetFontColor = function( color )
	{
		this.div.style.color =color;
	};

	/**
		設置透明度 
	*/
	PG.PointEntity.prototype.SetOpacity = function( num )
	{
		PG.Tool.setOpacity(this.div,num);
	};

	/**
		設置標注的文本內容是否允許換行
	*/
	PG.PointEntity.prototype.SetNoWrap = function( booleans )
	{
		this.div.noWrap = booleans;
	};

	/**
		設置z-Index 
	*/
	PG.PointEntity.prototype.setZindex = function(focus,blur){
		this.zIndexs=[focus,blur];
		this.div.style.zIndex = focus;
	};
	
	/**
		打開信息窗口的底層方法
	*/
	PG.PointEntity.prototype.openInfoWinBase= function(content)
	{
		this.map._MarkerInfoWin.SetText(content);
		this.map._MarkerInfoWin.SetPoint( this );
		this.focus();
		if(!this.iwcl){this.iwcl=PG.Event.bind(this.map._MarkerInfoWin,"OnClose",this,this.onInfoWinClose);}
		this.map.AddEntity( this.map._MarkerInfoWin );
		return this.map._MarkerInfoWin;
	};

	/**
		關閉信息窗口時觸發 	
	*/
	PG.PointEntity.prototype.onInfoWinClose= function()
	{
		this.blur();
		PG.Event.removeListener(this.iwcl);
		this.iwcl=null;
	};

	/**
		打開信息窗口
	*/
	PG.PointEntity.prototype.OpenWindowElement = function( obj ){return this.openInfoWinBase(obj);};
	
	/**
		打開信息窗口
	*/
	PG.PointEntity.prototype.OpenWindowUrl = function( url ){return this.openInfoWinBase("<iframe src='"+url+"' width='100%' height='100%' frameBorder='0' scrolling='no'>");};
	
	/**
		打開信息窗口
	*/
	PG.PointEntity.prototype.OpenWindowHtml = function( html ){return this.openInfoWinBase(html);};
	
	/**
		返回所處的位置
	*/
	PG.PointEntity.prototype.getPoint = function(){return this.point;};
	
	/**
		關閉信息窗口高度
	*/
	PG.PointEntity.prototype.CloseWindow = function(){
		this.map._MarkerInfoWin.CloseWindow();
		PG.Event.trigger(this,"OnClose",[]);
	};

	/**
		設置信息窗口寬度
	*/
	PG.PointEntity.prototype.SetWindowWidth = function( w )
	{
		if(this.map)
		{
			this.map._MarkerInfoWin.setWidth( w );
		}
		else
		{
			PG.PointEntity.setInfoWinWidth(w);
		}
	};

	/**
		設置信息窗口高度
	*/
	PG.PointEntity.prototype.SetWindowHeight = function( h )
	{
		if(this.map)
		{
			this.map._MarkerInfoWin.setHeight( h );
		}
		else
		{
			PG.PointEntity.setInfoWinHeight(h);
		}
	};

	/**
		刪除
	*/
	PG.PointEntity.prototype.remove = function()
	{
		PG.Event.removeListener(this.mvl);
		this.mvl=null;
		PG.Event.removeListener(this.iwcl);
		this.iwcl=null;
		this.map=null;
	};

	/**
		銷毀 
	*/
	PG.PointEntity.prototype.depose = function()
	{
		var listener;
		while(listener = this.listeners.pop()){
			PG.Event.removeListener(listener);
		}
		PG.Event.deposeNode(this.div);
		//this.getIcon()可能為PG.DivIcon,此
		if(this.getIcon){
			this.getIcon().removeShadow();
		}
		this.div=null;
		this.map=null;
	};


	/**
		PG.MarkEntity類 
		icon:PG.Icon,PG.DivIcon
	*/
	function MarkEntity( point , icon )
	{
		var icon =icon?(icon.beUsed?icon.Copy():icon): new PG.Icon();
		var div=PG.Tool.createDiv(2);
		PG.Tool.setCursorStyle(div,"hand");
		PG.Tool.setZIndex(div,500);
		PG.Event.addListener(div,"dblclick",PG.Event.cancelBubble);
		var size=icon.GetSize();
		var mapText=new PG.PointEntity(point);
		if(size.width+size.height==0)
		{
			mapText.anchorPer=[0.5,1];
		}
		else
		{
			mapText.anchorPer=[0,0];
			var anchor=icon.GetAnchor();
			mapText.offset=new PG.Point(-anchor.x,-anchor.y);
		}
		mapText.zIndexs=[490,510];
		mapText.icon=icon;
		mapText.markerDiv=div;
		mapText.SetBackgroundColor("");
		mapText.SetBorderLine(0);
		mapText.SetIconImage=this.SetIconImage;
		mapText.GetIcon=this.GetIcon;
		mapText.setIcon=this.setIcon;
		mapText.GetSize=function(){return this.icon.GetSize();};
		mapText.GetAnchor=function(){return this.icon.GetAnchor();};
		mapText.calImgSize = PG.MarkEntity.calImgSize;
		mapText.onOk = PG.MarkEntity.onOk;
		mapText.onErr = PG.MarkEntity.onErr;
		PG.Tool.setZIndex(mapText.GetObject(),mapText.zIndexs[0]);
		if(icon.getImgObject){
			var iconObj=icon.GetImgObject();
			mapText.iconObj = iconObj;
			PG.Event.bind(iconObj,"load",mapText,mapText.onViewChange);
		}
		mapText.SetText(div);
		div.appendChild(icon.GetObject());
		mapText.type = window.PG.ENTITY_MARKER;
		return mapText;
	}
	PG.MarkEntity = MarkEntity;
	
	/**
		設置信息窗口寬度
	*/
	PG.MarkEntity.setWindowWidth = function( w )
	{
		if(PG.PointEntity.map )
		{
			PG.PointEntity.map._MarkerInfoWin.setWidth( w );
		}
		else
		{
			PG.PointEntity.infoWinWidth = w;
		}
		
	};

	/**
		設置信息窗口高度
	*/
	PG.MarkEntity.setWindowHeight = function( h )
	{
		if( PG.PointEntity.map )
		{
			PG.PointEntity.map._MarkerInfoWin.setHeight( h );
		}
		else
		{
			PG.PointEntity.infoWinHeight = h;
		}
	};

	/**
		返回Icon
	*/
	PG.MarkEntity.prototype.GetIcon = function(){return this.icon;};

	/**
		設置Icon
	*/
	PG.MarkEntity.prototype.setIcon=function(icon)
	{
		this.icon=icon.beUsed?icon.Copy():icon;
		this.div.removeChild(this.div.firstChild);
		this.div.appendChild(this.icon.getObject());
		this.anchorPer=[0,0];
		var anchor=icon.GetAnchor();
		this.offset=new PG.Point(-anchor.x,-anchor.y);
		this.calImgSize();
		this.reDraw(true);
	};

	/**
		加載圖標圖片 
	*/
	PG.MarkEntity.calImgSize = function(){
		this.sizeImg = document.createElement("img");
		this.sizeImgListenerSuc = PG.Event.bind(this.sizeImg,"load",this,this.onOk);
		this.sizeImgListenerErr = PG.Event.bind(this.sizeImg,"error",this,this.onErr);
		document.body.appendChild(this.sizeImg);
		this.sizeImg.style.position = "absolute";
		this.sizeImg.style.left = "-10000px";
		this.sizeImg.src = this.icon.getSrc();
	};

	/**
		圖標圖片加載成功後執行 
	*/
	PG.MarkEntity.onOk = function(){
		var sz = new PG.Size(this.sizeImg.offsetWidth,this.sizeImg.offsetHeight);
		sz[0] = sz.width;
		sz[1] = sz.height;
		this.icon.SetSize(sz);
		this.onErr();
		this.reDraw(true);
	};

	/**
		圖標圖片加載出錯後執行 
	*/
	PG.MarkEntity.onErr = function(){
		PG.Event.removeListener(this.sizeImgListenerSuc);
		PG.Event.removeListener(this.sizeImgListenerErr);
		document.body.removeChild(this.sizeImg);
		this.sizeImg = null;
	};

	/**
		設置Icon圖片 
	*/
	PG.MarkEntity.prototype.SetIconImage = function(url,size,anchor ){this.icon.SetImageUrl(url,size,anchor);};
		
	window.PG.PointEntity = PG.PointEntity;
	window.PG.MarkEntity = PG.MarkEntity;
}
NSPointEntity();