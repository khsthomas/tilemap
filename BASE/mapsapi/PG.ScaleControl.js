/**
	本文件是JS API之中的PG.ScaleControl類,是地圖的一個比例尺控件
	每個控件應該有initialize,getObject,depose三個方法
	
*/
function MapNSScaleControl()
{
	function ScaleControl()
	{
		PG.Tool.inherit(this,PG.Control);
		this.div=PG.Tool.createDiv(1);
		this.units=[[1000,"公里"],[1,"米"]];
		this.feetUnits=[[5280,"英里"],[1,"英尺"]];
		var style=this.div.style;
		style.align="center";
		style.left="20px";
		style.bottom="30px";
		style.height="26px";
		style.border="0px";
		//文字公里
		this.span=PG.Tool.createDiv(1);
		var style=this.span.style;
		style.height="15px";
		style.fontSize="12px";
		style.left="6px";
		style.top="-3px";
		this.span.align="center";
		this.span.noWrap=true;
		this.div.appendChild(this.span);

//橫條
		this.scale=PG.Tool.createDiv(1);
		var style=this.scale.style;
		style.width="100%";
		style.top="12px";
		style.height="3px";
		style.left="3px";
		style.fontSize="0px";
		style.zIndex="2";
		style.borderTop = "1px solid white";
		style.borderBottom = "1px solid white";
		style.borderRight = "1px solid white";
		this.div.appendChild(this.scale);
		
//		左側
		var scaleLeft=PG.Tool.createDiv(1);
		PG.Tool.SetSize(scaleLeft,[2,26]);
		var style=scaleLeft.style;
		style.top="0px";
		style.fontSize="0px";
		style.border = "1px solid white";
		this.div.appendChild(scaleLeft);
		this.scaleLeft=scaleLeft;
//		公里右側
		var scaleRight=PG.Tool.createDiv(1);
		PG.Tool.SetSize(scaleRight,[2,15]);
		var style=scaleRight.style;
		style.top="-3px";
		style.fontSize="0px";
		style.borderLeft="1px solid white";
		style.borderRight="1px solid white";
		style.borderTop="1px solid white";
		style.zIndex="3";
		this.div.appendChild(scaleRight);
		this.scaleRight=scaleRight;
		
//		英尺右側
		var feetDiv = PG.Tool.createDiv(1);
		PG.Tool.SetSize(feetDiv,[2,12]);
		var style=feetDiv.style;
		style.bottom="-3px";
		style.fontSize="0px";
		style.borderLeft="1px solid white";
		style.borderRight="1px solid white";
		style.borderBottom="1px solid white";
		style.zIndex="3";
		this.div.appendChild(feetDiv);
		this.feetDiv=feetDiv;
		
//		文字英里
		this.feetspan=PG.Tool.createDiv(1);
		var style=this.feetspan.style;
		style.height="15px";
		style.fontSize="12px";
		style.left="6px";
		style.bottom="-8px";
		this.feetspan.align="center";
		this.feetspan.noWrap=true;
		this.div.appendChild(this.feetspan);
		
		this.SetColor("#000");
	}
	PG.ScaleControl = ScaleControl;

	/**
		初始化		
	*/
	PG.ScaleControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.listener=PG.Event.bind(this.map,"OnMove",this,this.sProxy);
		this.virechangeListener = PG.Event.bind(this.map,"OnChangeMaptype",this,this.onMaptypeChange);
		if(this.map.centerPoint){
			this.resetScale(this.map.centerPoint,true);
		}
		this.onMaptypeChange(map.GetCurrentMapType());
	};

	/**
		地圖類型改變時觸發		
	*/
	PG.ScaleControl.prototype.onMaptypeChange=function(maptype){
		if(maptype==window.PG.NORMAL_MAP){
			this.span.style.color = "white";
			this.feetspan.style.color = "white";
		}else{			
			this.span.style.color = "black";
			this.feetspan.style.color = "black";
		}
	};

	/**
		設置比例尺控件背景顏色	
	*/
	PG.ScaleControl.prototype.SetColor=function(color)
	{
		this.scaleRight.style.backgroundColor=color;
		this.scale.style.backgroundColor=color;
		this.scaleLeft.style.backgroundColor=color;
		this.feetDiv.style.backgroundColor=color;
	};

	/**
		設置比例尺寬度
	*/
	PG.ScaleControl.prototype.setfeetwidth=function(w)
	{
		if(isNaN(w)) return;
		this.feetDiv.style.left = w+"px";
	};

	/**
		設置容器寬度
	*/
	PG.ScaleControl.prototype.setContainerwidth=function(w)
	{
		if(isNaN(w)) return;
		this.div.style.width = w+"px";
	};

	/**
		設置比例尺右邊距離 
	*/
	PG.ScaleControl.prototype.setKMwidth=function(w)
	{
		if(isNaN(w)) return;
		this.scaleRight.style.left = w+"px";
	};

	/**
		地圖移動時執行

		point:	地圖中心點
		flag	為true代表初始化或改變縮放等級,將當前中心點變為區域中心點
		參考PG.Map.prototype.moveMapImages
	*/
	PG.ScaleControl.prototype.sProxy = function(point,flag){
		var _this = this;
		if(this.time_out){
			window.clearTimeout(this.time_out);
			this.time_out = null;
		}
		this.time_out = window.setTimeout(function(){
			_this.resetScale(point,flag);
			
		},200);
	};

	/**
		重置比例尺
	*/
	PG.ScaleControl.prototype.resetScale=function(point,flag)
	{
		//if(!flag){return;}
		var bounds=this.map.getBoundsLatLng();
		if(this.map.GetZoomLevel()<5){
			var lngMin = new PG.Point(8000000,point.GetY(),false);
			var lngMax = new PG.Point(14000000,point.GetY(),false);
			var pxDis = this.map.fromLatLngToContainerPixel(lngMax)[0] - this.map.fromLatLngToContainerPixel(lngMin)[0];
			var dis = PG.Tool.getPointsDistance(lngMin,lngMax)/pxDis;
		}else{
			var dis = PG.Tool.getPointsDistance(new PG.Point(bounds.left,point.y,false),new PG.Point(bounds.right,point.y,false))/this.map.viewSize[0];
		
		}

		var ft = dis*3.2808399;//米轉英尺
		
		//格式化英尺
		var tmpAry = this.formatScale(ft);
		var ftscale=tmpAry[0];
		var ftsize=tmpAry[1];
		
		for(var i=0;i<this.feetUnits.length;i++)
		{
			if(ftscale>=this.feetUnits[i][0])
			{
				tmpAry = this.formatScale(ft/this.feetUnits[i][0]);
				ftscale=tmpAry[0];
				ftsize=tmpAry[1];
				this.feetspan.innerHTML=ftscale+""+this.feetUnits[i][1];
				break;
			}
		}
		this.setfeetwidth(Math.round(ftsize));
		
		//格式化米
		tmpAry = this.formatScale(dis);
		var mscale=tmpAry[0];
		var msize=tmpAry[1];
		
		this.span.innerHTML=mscale;
		for(var i=0;i<this.units.length;i++)
		{
			if(mscale>=this.units[i][0])
			{
				this.span.innerHTML=mscale/this.units[i][0]+""+this.units[i][1];
				break;
			}
		}
		this.setKMwidth(Math.round(msize));
		this.setContainerwidth(Math.round(Math.max(ftsize,msize)));
	};

	/**
		dis		兩個經緯度點之間的距離
	*/
	PG.ScaleControl.prototype.formatScale = function(dis){
//		lee 註釋  在dis為0.02到0.2之間返回10,在0.2到2之間返回100,在2到20之間返回1000
//		lee 就是dis*50
//		lee mscale是為了格式化值的(msize控制在500到50倍) 				msize最大範圍在500倍以內
//		格式化米
		var mscale=Math.pow(10,Math.ceil(Math.log(dis*50)/Math.log(10)));
		var msize=mscale/dis;
		if(msize>=250){msize/=5;mscale/=5;}
		if(msize>=200){msize/=4;mscale/=4;}
		if(msize>=100){msize/=2;mscale/=2;}
		return	[mscale,msize];
	};

	/**
		返回容器
	*/
	PG.ScaleControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		刪除控件
	*/
	PG.ScaleControl.prototype.remove=function()
	{
		PG.Event.removeListener(this.listener);
		this.listener=null;
		PG.Event.removeListener(this.virechangeListener);
		this.virechangeListener = null;
		this.map=null;
	};

	/**
		銷毀控件
	*/
	PG.ScaleControl.prototype.depose=function()
	{
		PG.Event.deposeNode(this.div);
		this.div=null;
		this.span=null;
		this.scale=null;
	};

	window.PG.ScaleControl=PG.ScaleControl;
}
MapNSScaleControl();