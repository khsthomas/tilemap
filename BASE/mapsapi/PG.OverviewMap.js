/**
	本文件是JS API之中的PG.OverviewMap和PG.OverviewMapControl對像,用來在頁面或地圖上顯示一個鷹眼地圖
	viewmap: OnViewChange 
	control: overviewBuild, sizechange, remove

*/
function MapNSOverviewMap()
{	
	/**
		創建一個鷹眼地圖,參數分別為：
		map			為哪個地圖創建鷹眼地圖
		container	用來顯示鷹眼地圖的層(div)
		point		可選,指定鷹眼地圖中心,如果不指定,則隨原地圖而變化
		zoom		可選,指定鷹眼地圖的縮放等級,如果不指定,則隨原地圖而變化
		zoomAdd		可選,如果沒有指定zoom,則可以用zoomAdd指定鷹眼地圖和原地圖之間的縮放等級差
	*/
	function OverviewMap(map,container,point,zoom,zoomAdd)
	{
		this.map=map;
		this.container=container;
		PG.Event.addListener(this.container,document.all?"mousewheel":"DOMMouseScroll",PG.Event.cancelBubble);
		PG.Tool.setZIndex(this.container,10000);
		this.point=point;
		this.zoom=zoom;
		this.zoomAdd=typeof(zoomAdd)=="number"?parseInt(zoomAdd):4;
		//miniMap 也是一個PG.Map物件
		var miniMap=new PG.Map(container);
		//挷在主地圖的OnChangeMaptype trigger
		PG.Event.bind(this.map,"OnChangeMaptype",this,this.onMaptypeChange);
		this.miniMap=miniMap;
		if(miniMap.progress)
		{
			miniMap.RemoveControl(miniMap.progress,true);
		}
		if(this.point){this.miniMap.DisableDrag();}

		//設置中心矩形
		this.rectBorder=PG.Tool.createDiv(1);
		this.rectBorder.align="left";
		var style=this.rectBorder.style;
		style.border="solid 1px #1c4bfd";
		style.fontSize="0px";
		miniMap.AddControl(new PG.HtmlElementControl(this.rectBorder));
		
		var bg=PG.Tool.createDiv(1);
		PG.Tool.SetSize(bg,["100%","100%"]);
		bg.style.backgroundColor="#5895b6";
		this.rectBorder.appendChild(bg);
		PG.Tool.setOpacity(this.rectBorder.firstChild,0.5);
		PG.Tool.setOpacity(this.rectBorder,0.5);
		
		var circle=PG.Tool.createDiv(1);
		circle.style.backgroundColor="#1c4bfd";
		circle.style.fontSize="0px";
		PG.Tool.SetSize(circle,["50%","1px"]);
		PG.Tool.setPosition(circle,["25%","50%"]);
		this.rectBorder.appendChild(circle);
		
		circle=PG.Tool.createDiv(1);
		circle.style.backgroundColor="#1c4bfd";
		circle.style.fontSize="0px";
		PG.Tool.SetSize(circle,["1px","50%"]);
		PG.Tool.setPosition(circle,["50%","25%"]);
		this.rectBorder.appendChild(circle);
		
		this.rectBack=this.rectBorder.cloneNode(true);
		this.miniMap.AddControl(new PG.HtmlElementControl(this.rectBack));
		this.enable();
		//取得當前地圖maptype
		var mp = this.map.GetCurrentMapType();
		this.onMaptypeChange(mp);
 	}
	PG.OverviewMap = OverviewMap;

	/**
		設置地圖類型		
	*/
	PG.OverviewMap.prototype.onMaptypeChange=function(maptype){
		this.miniMap.SetMapType(maptype);
	};
	
	/**
		重置		
	*/
	PG.OverviewMap.prototype.resetRect=function(point,mType)
	{
		this.dragPoint=null;
		if(!this.point && (mType=="m_drag" || mType=="m_dblclick"))
		{
			this.map.ZoomPan(point);
		}
		if(!this.point){this.setRectPosition(this.rectBack,this.miniMap.GetCenter());}
	};

	/**
		開始拖放矩形框	
	*/
	PG.OverviewMap.prototype.onRectMouseDown=function(e)
	{
		PG.Event.cancelBubble(e);
		if(this.dragObject){this.onRectMouseUp(e);}
		if(this.map.slideObject){this.map.slideEnd();}
		if(this.miniMap.slideObject){this.miniMap.slideEnd();}
		this.resetRect();
		this.dragObject={"startPosition":[parseInt(this.rectBack.style.left),parseInt(this.rectBack.style.top)],"preMove":[0,0],"startPoint":[e.clientX,e.clientY],"timeout":window.setInterval(PG.Event.getCallback(this,this.onRectMouseMove),16),"moveListener":PG.Event.bind(document,"mousemove",this,this.onRectMouseMove),"upListener":PG.Event.bind(document,"mouseup",this,this.onRectMouseUp)};
	};

	/**
		拖動矩形框	
	*/
	PG.OverviewMap.prototype.onRectMouseMove=function(e)
	{
		var point;
		if(typeof(e)!="object"){point=this.dragEvent;}else{this.dragEvent=[e.clientX,e.clientY];}
		if(!point){return;}
		var dragObject=this.dragObject;
		PG.Tool.setPosition(this.rectBack,this.getDragPoint(point));
		this.miniMap.setCenterAtLatLng(this.miniMap.fromContainerPixelToLatLng([this.miniMap.viewSize[0]/2+this.moveSize[0],this.miniMap.viewSize[1]/2+this.moveSize[1]]));
		dragObject.preMove[0]+=this.moveSize[0];
		dragObject.preMove[1]+=this.moveSize[1];
	};

	/**
		獲取矩形框的拖動距離	
	*/
	PG.OverviewMap.prototype.getDragPoint=function(point)
	{
		var dragObject=this.dragObject;
		var size=[dragObject.startPosition[0]-dragObject.startPoint[0]+point[0],dragObject.startPosition[1]-dragObject.startPoint[1]+point[1]];
		var moveSize=[0,0];
		if(!this.point)
		{
			if(size[0]<0)
			{
				size[0]=0;
				moveSize[0]=-1;
			}
			if(size[1]<0)
			{
				size[1]=0;
				moveSize[1]=-1;
			}
			if(size[0]>this.miniMap.viewSize[0]-this.rectSize[0])
			{
				size[0]=this.miniMap.viewSize[0]-this.rectSize[0];
				moveSize[0]=1;
			}
			if(size[1]>this.miniMap.viewSize[1]-this.rectSize[1])
			{
				size[1]=this.miniMap.viewSize[1]-this.rectSize[1];
				moveSize[1]=1;
			}
		}
		this.moveSize=moveSize;
		return size;
	};

	/**
		完成矩形框的拖動過程	
	*/
	PG.OverviewMap.prototype.onRectMouseUp=function(e)
	{
		PG.Event.cancelBubble(e);
		var dragObject=this.dragObject;
		PG.Event.removeListener(dragObject.moveListener);
		PG.Event.removeListener(dragObject.upListener);
		window.clearInterval(dragObject.timeout);
		var point=this.getDragPoint([e.clientX,e.clientY]);
		if(!this.point)
		{
			this.dragPoint=this.miniMap.fromContainerPixelToLatLng([this.miniMap.viewSize[0]/2+point[0]-dragObject.startPosition[0],this.miniMap.viewSize[1]/2+point[1]-dragObject.startPosition[1]]);//這個參數代表本次移動是通過拖動信息浮窗上的矩形控制的,因此在移動之中要同時移動兩個層this.rectBorder和this.rectBack
			this.miniMap.move([point[0]-dragObject.startPosition[0],point[1]-dragObject.startPosition[1]]);
		}
		this.map.move([(point[0]-dragObject.startPosition[0]+dragObject.preMove[0])*this.units,(point[1]-dragObject.startPosition[1]+dragObject.preMove[1])*this.units]);
		this.dragEvent=null;
		this.dragObject=null;
	};

	/**
		初始化鷹眼地圖	
	*/
	PG.OverviewMap.prototype.InitMap=function()
	{
		if(!this.map.loaded){return;}
		var point=this.point?this.point:this.map.GetCenter();
		if(!this.miniMap.loaded)
		{
			this.miniMap.centerAndZoom(point,this.getMiniMapZoom());
		}
		else
		{
			this.miniMap.ZoomPan(point);
			this.miniMap.zoomTo(this.getMiniMapZoom());
		}
		//初始化矩形框大小和位置
		var bounds=this.map.getBoundsLatLng();
		var tl=this.miniMap.fromLatLngToContainerPixel(new PG.Point(bounds.left,bounds.top,false));
		var br=this.miniMap.fromLatLngToContainerPixel(new PG.Point(bounds.right,bounds.bottom,false));
		this.rectSize=[br[0]-tl[0],br[1]-tl[1]];
		this.rectOffset=[0,0];
		var minSize=10;
		var maxSize=[parseInt(this.miniMap.viewSize[0]/2),parseInt(this.miniMap.viewSize[1]/2)];
		if(this.rectSize[0]<minSize)
		{
			this.rectOffset[0]=minSize-this.rectSize[0];
			this.rectSize[0]=minSize;
		}
		if(this.rectSize[1]<minSize)
		{
			this.rectOffset[1]=minSize-this.rectSize[1];
			this.rectSize[1]=minSize;
		}
		if(this.rectSize[0]>maxSize[0])
		{
			this.rectOffset[0]=this.rectSize[0]-maxSize[0];
			this.rectSize[0]=maxSize[0];
		}
		if(this.rectSize[1]>maxSize[1])
		{
			this.rectOffset[1]=this.rectSize[1]-maxSize[1];
			this.rectSize[1]=maxSize[1];
		}
		this.units=Math.pow(2,this.map.GetZoomLevel()-this.miniMap.GetZoomLevel());
		this.setRectPosition(this.rectBack,this.map.GetCenter());
		PG.Tool.SetSize(this.rectBack,this.rectSize);
		this.setRectPosition(this.rectBorder,this.map.GetCenter());
		PG.Tool.SetSize(this.rectBorder,this.rectSize);
	};

	/**
		根據主地圖縮放等級計算鷹眼地圖縮放等級	
	*/
	PG.OverviewMap.prototype.getMiniMapZoom=function()
	{
		var zoom=this.zoom;
		if(typeof(zoom)=="number"){return zoom;}
		var index=this.map.zoomIndex-this.zoomAdd;
		if(index>=this.miniMap.zoomLevels.length){index=this.miniMap.zoomLevels.length-1;}
		if(index<0){index=0;}
		return this.miniMap.zoomLevels[index];
	};

	/**
		返回鷹眼地圖	
	*/
	PG.OverviewMap.prototype.getMiniMap=function()
	{
		return this.miniMap;
	};

	/**
		設置中心矩形背景顏色	
	*/
	PG.OverviewMap.prototype.setRectBackColor=function(color)
	{
		this.rectBorder.style.backgroundColor=color;
		this.rectBack.style.backgroundColor=color;
	};

	/**
		設置中心矩形邊框顏色	
	*/
	PG.OverviewMap.prototype.setRectBorderColor=function(color)
	{
		this.rectBorder.style.borderColor=color;
		this.rectBack.style.borderColor=color;
	};

	/**
		設置中心矩形邊框寬度	
	*/
	PG.OverviewMap.prototype.setRectBorderStroke=function(weight)
	{
		this.rectBorder.style.borderWidth=weight;
		this.rectBack.style.borderWidth=weight;
	};

	/**
		地圖移動後重新設置鷹眼地圖	
	*/
	PG.OverviewMap.prototype.setRectPosition=function(rect,point)
	{
		if(!this.rectSize){return;}
		var p=this.miniMap.fromLatLngToContainerPixel(point);
		PG.Tool.setPosition(rect,[p[0]-this.rectSize[0]/2,p[1]-this.rectSize[1]/2]);
	};

	/**
		在主地圖或者鷹眼地圖移動時,實時設置矩形的位置	
	*/
	PG.OverviewMap.prototype.onMapMove=function()
	{
		this.setRectPosition(this.rectBorder,this.map.GetCenter());
		if(this.dragPoint){this.setRectPosition(this.rectBack,this.dragPoint);}
	};

	/**
		在地圖移動完成後進行移動鷹眼地圖等操作	
	*/
	PG.OverviewMap.prototype.onMapMoveEnd=function()
	{
		if(!this.map.loaded){return;}
		if(!this.miniMap.loaded){this.InitMap();}
		if(!this.point)
		{
			if(!this.dragPoint && !this.miniMap.dragObject && (!this.miniMap.slideObject || this.miniMap.slideObject.mtype!="m_dblclick"))
			{
				this.miniMap.ZoomPan(this.map.GetCenter());
			}
		}
		else
		{//如果鷹眼地圖是位置固定模式,則移動Back框位置
			this.dragPoint=this.map.GetCenter();
			this.onMapMove();
			this.dragPoint=null;
		}
		var zoom=this.getMiniMapZoom();
		if(zoom!=this.miniMap.GetZoomLevel()){this.miniMap.zoomTo(zoom);}
	};

	/**
		啟用鷹眼地圖,添加事件監聽器	
	*/
	PG.OverviewMap.prototype.enable=function()
	{
		if(this.listeners){return;}
		this.listeners=[
		PG.Event.bind(this.rectBack,"mousedown",this,this.onRectMouseDown),
		PG.Event.bind(this.map,"OnMoveEnd",this,this.onMapMoveEnd),
		PG.Event.bind(this.map,"OnMove",this,this.onMapMove),
		PG.Event.bind(this.map,"OnZoom",this,this.InitMap),
		PG.Event.bind(this.map,"OnResize",this,this.InitMap),
		PG.Event.bind(this.miniMap,"OnMoveEnd",this,this.resetRect),
		PG.Event.bind(this.miniMap,"OnMove",this,this.onMapMove)];
		this.InitMap();
	};

	/**
		禁用鷹眼地圖	
	*/
	PG.OverviewMap.prototype.disable=function()
	{
		var listener,listeners=this.listeners;
		if(!listeners){return;}
		while(listener=listeners.pop())
		{
			PG.Event.removeListener(listener);
		}
		this.listeners=null;
	};


	/**
		用來將Overview地圖以控件模式添加到主地圖的對象,參數分別為：

		direction 鷹眼控件的位置類型,該類型代表將鷹眼地圖綁定到地圖的哪個方位.

		一共有9種位置(從-4到4),默認值是4(綁定到右下角)
		具體從-4到4每一個數字代表的綁定方位:
		-4:左上角		-1:頂邊					2:右上角
		-3:左邊			 0:不綁定,任意位置		3:右邊
		-2:左下角		 1:底邊					4:右下角(默認)

		size		設置地圖的大小,如：[200,200]
		point		可選,指定鷹眼地圖中心,如果不指定,則隨原地圖而變化
		zoom		可選,指定鷹眼地圖的縮放等級,如果不指定,則隨原地圖而變化
		zoomAdd		可選,如果沒有指定zoom,則可以用zoomAdd指定鷹眼地圖和原地圖之間的縮放等級差	
	*/	
	function OverviewMapControl(direction,size,point,zoom,zoomAdd,pad)
	{
		if(size){
			if(size.width&&size.height){
				size = [size.width,size.height];
			}
		}
		if(point){
			if(point.x&&point.y){
				point = [point.x,point.y];
			}
		}
		this.bInfo = PG.Tool.browserInfo();
		PG.Tool.inherit(this,PG.Control);
		pad=pad?pad:8;
		this.pad=pad;
		this.direction=(typeof(direction)=="number" && direction<=4 && direction>=-4)?parseInt(direction):4;
		var size=size?size:[260,170];
		this.point=point;
		this.zoom=zoom;
		this.zoomAdd=zoomAdd;
		this.buttonSrc=window.PG._omc_images?window.PG._omc_images:[window.PG._IMG_PATH+"/omc_close.gif",window.PG._IMG_PATH+"/omc_open.gif"];
		this.img_bg_pos = [[0,0],[0,0]];
		
		this.div=PG.Tool.createDiv(1);
		PG.Tool.setZIndex(this.div,800);
		
		//創建外層DIV
		this.resizeDiv=PG.Tool.createDiv(1);
		this.div.appendChild(this.resizeDiv);
		this.resizeDiv.style.overflow="hidden";
		this.resizeDiv.style.backgroundColor="#D1D1DF";
		
		//創建地圖DIV
		this.mapDiv=PG.Tool.createDiv(1);
		this.mapDiv.style.backgroundColor="#FFFFFF";
		PG.Tool.SetSize(this.mapDiv,size);
		if(this.direction==1||this.direction==-1){
			size=[size[0]+pad*2,size[1]+pad];
		}else if(this.direction==-3||this.direction==3){
			size=[size[0]+pad,size[1]+pad*2];
		}else{
			size=[size[0]+pad,size[1]+pad];
		}
		this.resizeDiv.appendChild(this.mapDiv);
		this.size=size;
		this.setMapPosition(this.direction);
		//設定邊框
		this.mapDiv.style.border="solid 1px #ADACBE";
		
		PG.Tool.SetSize(this.div,[size[0]+2,size[1]+2]);
		PG.Tool.SetSize(this.resizeDiv,size);
		
		this.button=document.createElement("div");
		this.button.style.position="absolute";
		this.button.style.fontSize = "0px";
		PG.Tool.setCursorStyle(this.button,"pointer");
		PG.Event.bind(this.button,this.bInfo.isMwk?"touchstart":"click",this,this.ChangeView);
		PG.Event.addListener(this.button,"dblclick",PG.Event.cancelBubble);
		PG.Event.addListener(this.button,this.bInfo.isMwk?"touchstart":"mousedown",PG.Event.cancelBubble);
		PG.Tool.setZIndex(this.button,"10000");
		PG.Tool.SetSize(this.button,[18,17]);
		this.setButtonPosition(this.direction);
		this.showing=true;
	}
	PG.OverviewMapControl = OverviewMapControl;

	/**
		初始化地圖	
	*/
	PG.OverviewMapControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.mini=new PG.OverviewMap(map,this.mapDiv,this.point,this.zoom,this.zoomAdd);
		if(this.rectBackColor){this.mini.setRectBackColor(this.rectBackColor);}
		if(this.rectBorderColor){this.mini.setRectBorderColor(this.rectBorderColor);}
		if(this.rectBorderStroke){this.mini.setRectBorderStroke(this.rectBorderStroke);}
		if(this.showing==true){this.mini.enable();}
		this.div.appendChild(this.button);

		this.setImg(true);
		PG.Event.trigger(PG.OverviewMapControl,"overviewBuild",[this]);
		
		document.body.appendChild(this.div);
		var _this = this;
		if(!this.bInfo.isIE6){
			var size = [this.resizeDiv.offsetWidth,this.resizeDiv.offsetHeight];
			PG.Tool.SetSize(this.div,[size[0]+this.button.offsetWidth,size[1]+this.button.offsetHeight]);
			_this.button.onload = function(){
				setTimeout(function(){
						var size = [_this.resizeDiv.offsetWidth,_this.resizeDiv.offsetHeight];
						PG.Tool.SetSize(_this.div,[size[0]+_this.button.offsetWidth,size[1]+_this.button.offsetHeight]);
						_this.button.onload = null;
					},0);
			}
		}
	};

	/**
		設置鷹眼控件的位置類型	
	*/
	PG.OverviewMapControl.prototype.setMapPosition=function(direction,pad)
	{
		pad=(typeof(pad)=="number")?pad:-this.pad;
		this.setPosition(this.div,direction,false,0);
		this.setPosition(this.resizeDiv,direction,true);
		PG.OverviewMapControl.setMPosition(this.mapDiv,direction,true,-pad-1);		
		PG.OverviewMapControl.setDivBorder(this.resizeDiv,direction);
	};

	/**
		設置放大縮小按鈕位置 	
	*/
	PG.OverviewMapControl.prototype.setButtonPosition=function(direction,pad)
	{
		pad=(typeof(pad)=="number")?pad:this.pad;
		PG.OverviewMapControl.setMPosition(this.button,direction,false);
	};

	/**
		設置鷹眼控件的位置類型
	*/
	PG.OverviewMapControl.prototype.setCollapsePosition=function(direction)
	{
		this.direction=direction;
	};

	/**
		返回該鷹眼的地圖對像,利用本對像,即可向鷹眼地圖上添加的標注
	*/
	PG.OverviewMapControl.prototype.GetMiniMap=function(e)
	{
		if(this.mini)
		{
			return this.mini.map;
		}
	};

	/**
		設置位置	
	*/
	PG.OverviewMapControl.prototype.setPosition=function(div,direction,flag,p)
	{
		var style=div.style;
		style.position="absolute";
		p=(typeof(p)=="number")?(p+"px"):"0px";
		if(direction==0){direction=4;}
		if(direction<-1){style.right="auto";style.left=p;}
		else if(direction>1){style.left="auto";style.right=p;}
		else{
			style.right="auto";
			style.left=flag?p:"50%";
			if(!flag){style.marginLeft = -this.size[0]/2 + "px";}
		}
		if((direction+6)%3==2){style.bottom="auto";style.top=p;}
		else if((direction+6)%3==1){style.top="auto";style.bottom=p;}
		else{
			style.bottom="auto";
			style.top=flag?p:"50%";
			if(!flag){style.marginTop = -this.size[1]/2 + "px";}
		}
	};
	
	/**
		設置位置	
	*/
	PG.OverviewMapControl.setMPosition=function(div,direction,flag,p)
	{
		var style=div.style;
		style.position="absolute";
		p=(typeof(p)=="number")?(p+"px"):"0px";
		if(direction==0){direction=4;}
		if(direction<-1){style.right="auto";style.left="0px";}
		else if(direction>1){style.left="auto";style.right="0px";}
		else{style.right="auto";style.left=flag?p:"50%";}
		if((direction+6)%3==2){style.bottom="auto";style.top="0px";}
		else if((direction+6)%3==1){style.top="auto";style.bottom="0px";}
		else{style.bottom="auto";style.top=flag?p:"50%";}
	};

	/**
		設置邊框
	*/
	PG.OverviewMapControl.setDivBorder=function(div,direction)
	{
		
		div.style.border="solid 1px #9595A2";
		var _s=div.style;
		p=(typeof(p)=="number")?(p+"px"):"0px";
		if(direction==0){direction=4;}
		if(direction<-1){_s.borderLeftStyle = "none";}
		else if(direction>1){_s.borderRightStyle = "none";}
		else{}
		if((direction+6)%3==2){_s.borderTopStyle = "none";}
		else if((direction+6)%3==1){_s.borderBottomStyle = "none";}
		else{}
	};

	/**
		改變大小		
	*/
	PG.OverviewMapControl.prototype.resizeTo=function(size)
	{
		if(this.slideObj){this.resizeEnd();}
		this.slideObj={"startSize":[parseInt(this.resizeDiv.style.width),parseInt(this.resizeDiv.style.height)],"endSize":size,"number":0,"timeout":window.setInterval(PG.Event.getCallback(this,this.resize),16)};
	};

	/**
		改變大小	
	*/
	PG.OverviewMapControl.prototype.resize=function()
	{
		var slideObj=this.slideObj;
		slideObj.number++;
		var totalNumber=25;
		
		var size=[slideObj.endSize[0]-(slideObj.endSize[0]-slideObj.startSize[0])*(Math.sin(Math.PI*(0.5-slideObj.number/totalNumber))+1)/2,slideObj.endSize[1]-(slideObj.endSize[1]-slideObj.startSize[1])*(Math.sin(Math.PI*(0.5-slideObj.number/totalNumber))+1)/2];
		PG.Tool.SetSize(this.resizeDiv,size);
		/*以下這個語句比較複雜,
		如果在IE下執行該語句,則會因為IE本身的處理機制而出現按鈕跳動的情況,
		如果不在firefox下執行該語句,則會因為firefox不支持事件穿透,而遮擋地圖上標記的點擊
		因此採用選擇性執行的方式
		*/
		if(!this.bInfo.isIE6){PG.Tool.SetSize(this.div,[size[0]+this.button.offsetWidth,size[1]+this.button.offsetHeight]);}
		if(slideObj.number==totalNumber){this.resizeEnd();}
		PG.Event.trigger(this,"sizechange",[size]);
	};

	/**
		改變大小完成執行 	
	*/
	PG.OverviewMapControl.prototype.resizeEnd=function()
	{
		var slideObj=this.slideObj;
		window.clearInterval(slideObj.timeout);
		this.slideObj=null;
	};

	/**
		切換鷹眼地圖的開-合狀態	
	*/
	PG.OverviewMapControl.prototype.ChangeView=function(e)
	{	
		PG.Event.cancelBubble(e);
		if(this.showing)
		{
			var size=[0,0];
			if(Math.abs(this.direction)==3){size[1]=this.size[1];}
			if(Math.abs(this.direction)==1){size[0]=this.size[0];}
			if(this.mini)
			{
				this.mini.disable();
				this.resizeTo(size);
			}
			else
			{
				PG.Tool.SetSize(this.resizeDiv,size);
			}
			this.setImg(false);
			this.showing=false;
		}
		else
		{
			if(this.mini)
			{
				this.mini.enable();
				this.resizeTo(this.size);
			}
			else
			{
				PG.Tool.SetSize(this.resizeDiv,this.size);
			}
			this.setImg(true);
			this.showing=true;
		}
		//觸發OnViewChange事件
		PG.Event.trigger(this,"OnViewChange",[this.showing,e]);
	};

	/**
		設置鷹眼地圖的按鈕圖片,要同時設置鷹眼地圖打開和關閉狀態下的兩張圖片	
	*/
	PG.OverviewMapControl.prototype.SetButtonImage=function(closeImg,openImg,size)
	{
		this.buttonSrc=[closeImg,openImg];
		if(!this.buttonSrc[1]){this.buttonSrc[1]=this.buttonSrc[0];}
		this.button.removeAttribute("src");
		if(this.showing){
			this.setImg(true);
		}else{
			this.setImg(false);
		}
		
		if(size){
			this.setButtonSize(size);
		}
	};

	/**
		設置放大縮小按鈕圖片	
	*/
	PG.OverviewMapControl.prototype.setImg = function(isOpen){
		if(isOpen){
			this.button.style.background = 'url('+this.buttonSrc[0]+') '+this.img_bg_pos[0][0]+'px '+this.img_bg_pos[0][1]+'px';
		}else{
			this.button.style.background = 'url('+this.buttonSrc[1]+') '+this.img_bg_pos[1][0]+'px '+this.img_bg_pos[1][1]+'px';
		}
	};

	/**
		改變放大縮小按鈕的大小	
	*/
	PG.OverviewMapControl.prototype.setButtonSize = function(size){
		PG.Tool.SetSize(this.button,size);
	};

	/**
		設置鷹眼地圖和主地圖之間空隙的邊框顏色	
	*/
	PG.OverviewMapControl.prototype.SetBorderColor=function(color)
	{
		this.resizeDiv.style.borderColor=color;
		this.mapDiv.style.borderColor=color;
	};

	/**
		設置鷹眼地圖和主地圖之間空隙的背景顏色	
	*/
	PG.OverviewMapControl.prototype.SetBackColor=function(color)
	{
		this.resizeDiv.style.backgroundColor=color;
	};

	/**
		設置鷹眼地圖上的矩形框背景顏色
	*/
	PG.OverviewMapControl.prototype.SetRectBackColor=function(color)
	{
		this.rectBackColor=color;
		if(this.mini){this.mini.setRectBackColor(color);}
	};

	/**
		設置鷹眼地圖上的矩形框邊框顏色	
	*/
	PG.OverviewMapControl.prototype.SetRectBorderColor=function(color)
	{
		this.rectBorderColor=color;
		if(this.mini){this.mini.setRectBorderColor(color);}
	};

	/**
		設置鷹眼地圖上的矩形框邊框寬度---此方法未公開 	
	*/
	PG.OverviewMapControl.prototype.setRectBorderStroke=function(weight)
	{
		this.rectBorderStroke=weight;
		if(this.mini){this.mini.setRectBorderStroke(weight);}
	};

	/**
		返回該鷹眼的視圖是否被打開	
	*/
	PG.OverviewMapControl.prototype.IsOpen=function(e)
	{
		return this.showing;
	};

	/**
		返回容器(此容器不是直接的地圖DIV容器)	
	*/
	PG.OverviewMapControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		刪除	
	*/
	PG.OverviewMapControl.prototype.remove = function()
	{
		this.mini.disable();
		this.map=null;
		PG.Event.trigger(this,"remove",[this]);
	};

	/**
		銷毀	
	*/
	PG.OverviewMapControl.prototype.depose=function()
	{
		this.mini.disable();
		PG.Event.deposeNode(this.div);
		this.div=null;
	};


	window.PG.OverviewMap=PG.OverviewMap;
	window.PG.OverviewMapControl=PG.OverviewMapControl;
}
MapNSOverviewMap();