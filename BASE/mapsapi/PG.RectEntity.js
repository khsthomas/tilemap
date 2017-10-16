/**
	本文件是JS API之中的PG.RectEntity,PG.EllipseEntity類

*/
function NSRectEntity()
{
	
	/**
		疊加層矩形對像

		bounds	類型是PG.Rect
		color	線條顏色
		bgcolor	背景顏色
		weight	線條寬度
		opacity	不透明度 0-1
	*/
	function RectEntity(bounds,color,bgcolor,weight,opacity,create)
	{
		this.bounds=bounds;
		this.color=(color||color=="")?color:"blue";
		this.bgcolor=(bgcolor||bgcolor=="")?color:"#99FFCC";
		this.weight=(weight||weight==0)?weight:3;
		this.opacity=(opacity||opacity==0)?opacity:0.5;

		this.type = window.PG.ENTITY_RECT;
		if(create){this.create=create;}
		this.create();
		this.SetLineStroke(this.weight);
		this.SetLineColor(this.color);
		this.SetOpacity(this.opacity);
		this.SetFillColor(this.bgcolor);
		this.SetLineStyle("solid");
		PG.Tool.setZIndex(this.div,420);

		this.dragPoints=[];//編輯點			xujinping
		this.dragcurs = [];//編輯點cursor	xujinping
		this.dpsoffset=[];//編輯點Icon偏移	xujinping

		if(this.div.tagName=='DIV'){
			PG.Event.bind(this.div,"click",this,this.onClick);
			PG.Event.bind(this.div,"mouseover",this,this.onMouseOver);
			PG.Event.bind(this.div,"mouseout",this,this.onMouseOut);
		}else{
			var th = this;
			//延遲1秒待瀏覽器繪製之後添加註冊事件,否則在IE下調用橢圓對象的設置屬性的方法會沒效果
			setTimeout(function(){
				PG.Event.bind(th.div,"click",th,th.onClick);
				PG.Event.bind(th.div,"mouseover",th,th.onMouseOver);
				PG.Event.bind(th.div,"mouseout",th,th.onMouseOut);
			},2000);
		}		
	}
	PG.RectEntity = RectEntity;


	/**
		返回疊加物類型		
	*/
	PG.RectEntity.prototype.GetType = function(){	
		return this.type;
	};

	/**
		創建容器		
	*/
	PG.RectEntity.prototype.create=function()
	{
		this.div=PG.Tool.createDiv(1);
		this.div.style.fontSize = "0px";	//設置字體為0,防止div高度跟隨字體大小而無法縮小
		PG.Tool.setUnSelectable(this.div);
	};

	/**
		鼠標移過時觸發		
	*/
	PG.RectEntity.prototype.onMouseOver=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnMouseOver",[new PG.Point(point[0],point[1])]);
	};

	/**
		鼠標移出時觸發			
	*/
	PG.RectEntity.prototype.onMouseOut=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnMouseOut",[new PG.Point(point[0],point[1])]);
	};

	/**
		鼠標點擊時觸發				
	*/
	PG.RectEntity.prototype.onClick=function(e)
	{
		var point=PG.Tool.getEventPosition(e,this.map.container);
		PG.Event.trigger(this,"OnClick",[new PG.Point(point[0],point[1]),PG.Tool.getEventButton(e)]);
	};
	
	/**
		判斷一個經緯度點是否在範圍之內	
		
		pt  :PG.Point

	*/
	PG.RectEntity.prototype.ContainsPoint = function(pt){
		if(!pt){return false;}
		if((pt.type!=window.PG.GEO_POINT)&&(pt.nowrap!=false)){return false;}
		return this.bounds.ContainsPoint(pt);
	}

	/**
		初始化				
	*/
	PG.RectEntity.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		PG.Event.trigger(this,"init",[]);
	};

	/**
		重新繪製	
	*/
	PG.RectEntity.prototype.reDraw=function(flag)
	{		
		if(!flag){return;}//如果不是必須重繪,則不重繪,大部分的標注都不需要每次重繪		
		//在地圖上畫矩形後,將地圖移出北京市區外,然後放大到街道級別,網頁JS就會提示內容為「參數錯誤」的錯誤信息.
		var lb=this.map.GetRelativeXY(new PG.Point(this.bounds.left,this.bounds.top,false));//取得範圍bounds左上角的坐標
		var rt=this.map.GetRelativeXY(new PG.Point(this.bounds.right,this.bounds.bottom,false));//取得範圍bounds右下角坐標
		this.draw(lb,rt);
	};

	/**
		繪製			
	*/
	PG.RectEntity.prototype.draw=function(lb,rt)
	{
		PG.Tool.setPosition(this.div,lb);
		PG.Tool.SetSize(this.div,[rt[0]-lb[0],rt[1]-lb[1]]);
	};

	/**
		返回容器			
	*/
	PG.RectEntity.prototype.GetObject=function(){return this.div;};

	/**
		刪除	
		此段代碼解決IE下能自動移除,而其他瀏覽器需要調用removeChild方法移除
	*/
	PG.RectEntity.prototype.remove=function()
	{
		if(!PG.BrowserInfo.isIE()){
			if(this.div.parentNode){
				if(this.svgroot)this.svgroot.removeChild(this.div);
			}
		}	
		this.map=null;
	};

	/**
		銷毀 			
	*/
	PG.RectEntity.prototype.depose=function()
	{
		if(this.graphics)
		{
			this.graphics.clear(); 
			this.graphics=null;
		}
		PG.Event.deposeNode(this.div);
		this.div=null;
		this.bounds=null;
	};

	/**
		返回此矩形的經緯度範圍			
	*/
	PG.RectEntity.prototype.GetBounds=function()
	{
		return this.bounds;
	};

	/**
		當編輯矩形時,移動編輯點時觸發的函數,重新繪製矩形
	*/
	PG.RectEntity.prototype.SetBounds=function(bounds)
	{
		this.bounds=bounds;
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取矩形圖形的邊框顏色		
	*/
	PG.RectEntity.prototype.GetLineColor=function()
	{
		return this.color;
	};

	/**
		設置矩形圖形的邊框顏色
	*/
	PG.RectEntity.prototype.SetLineColor=function(color)
	{
		this.color=color;
		this.div.style.borderColor=color;
	};

	/**
		獲取矩形圖形的背景填充色
	*/
	PG.RectEntity.prototype.GetFillColor=function()
	{
		return this.bgcolor;
	};

	/**
		設置矩形圖形的背景填充色
	*/
	PG.RectEntity.prototype.SetFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		this.div.style.backgroundColor=bgcolor;
	};

	/**
		獲取矩形透明度
	*/
	PG.RectEntity.prototype.GetOpacity=function()
	{
		return this.opacity;
	};

	/**
		設置矩形透明度
	*/
	PG.RectEntity.prototype.SetOpacity=function(opacity)
	{
		this.opacity=opacity;
		PG.Tool.setOpacity(this.div,this.opacity);
	};

	/**
		獲取矩形圖形的邊框線寬
	*/
	PG.RectEntity.prototype.GetLineStroke=function()
	{
		return this.weight;
	};

	/**
		設置矩形圖形的邊框線寬
	*/
	PG.RectEntity.prototype.SetLineStroke=function(weight)
	{
		this.weight=weight;
		this.div.style.borderWidth=weight + "px";
	};

	/**
		獲取矩形圖形的邊框線型
	*/
	PG.RectEntity.prototype.GetLineStyle=function(style)
	{
		return this.lineStyle;
	};

	/**
		設置邊框的顯示線型
		有以下幾種類型:Solid(實線,默認值),Dot(點線),Dash(折線)
	*/
	PG.RectEntity.prototype.SetLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(style.toLowerCase()=="dot"){style="dotted";}
		if(style.toLowerCase()=="dash"){style="dashed";}
		this.div.style.borderStyle=style;
	};	

	/**
		啟動編輯功能
		this.dragcurs.push("nw-resize");
		this.dragcurs.push("w-resize");
		this.dragcurs.push("ne-resize");
		this.dragcurs.push("s-resize");
		this.dragcurs.push("nw-resize");
		this.dragcurs.push("e-resize");
		this.dragcurs.push("ne-resize");
		this.dragcurs.push("n-resize");
	*/
	PG.RectEntity.prototype.EnableEdit = function(){
		this._eEdit = true;
		if(this.dpsoffset.length==0){
			if(this.type ==  window.PG.ENTITY_RECT){
				this.dpsoffset=[[8,8],[8,8],[8,5],[8,5],[5,5],[5,8],[5,8],[8,8]];
			}else{
				this.dpsoffset=[[8,8],[8,8],[8,9],[8,9],[9,9],[9,8],[9,8],[8,8]];
			}
		}		
		if(!this.map){
			this.onInitL = PG.Event.bind(this,"init",this,function(){
				this.startEdit(true);
				this.startDrag();
				PG.Event.removeListener(this.onInitL);
				this.onInitL = null;
			});
		}else{
			this.startEdit(true);
			this.startDrag();
		}
	};

	/**
		禁止編輯功能
	*/
	PG.RectEntity.prototype.DisableEdit = function(){
		this._eEdit = false;
		if(this.onInitL){
			PG.Event.removeListener(this.onInitL);
			this.onInitL = null;
		}
		this.endEdit();
	};

	/**
		是否啟動編輯功能
	*/
	PG.RectEntity.prototype.IsEditable = function(){
		return !!this._eEdit;
	};

	/**
		結束編輯
	*/
	PG.RectEntity.prototype.endEdit = function(){
		var l;
		while(l = this.listeners.pop()){
			PG.Event.removeListener(l);
		}
		this.listeners = [];
		for(var i=0;i<this.dragPoints.length;i++){
			this.map.RemoveEntity(this.dragPoints[i]);
		}
		PG.Event.trigger(this,'OnEditEnd',[]);//徐金評添加2012-6-20
	};

	/**
		開始編輯 

		isCreate	:boolean 是否創建 

		編輯點的順序：從左上角開始,逆時針(id從0到7)

		八個拖拽點	
		lt:left top; lm:leftmiddle; lb:leftbottom; tc:topcenter; 
		tr:topright; rm:rightmiddle; rb:rightbottom; bc:bottomcenter

		{lt:"nw-resize",lm:"w-resize",lb:"ne-resize",tc:"n-resize",
		tr:"ne-resize",rm:"e-resize",rb:"nw-resize",bc:"s-resize"};
	*/
	PG.RectEntity.prototype.startEdit = function(isCreate,ids){						
		var bounds=this.bounds;		
		var south_west = new PG.Point(bounds.left,bounds.bottom,false);//西南經緯度坐標
		var north_east = new PG.Point(bounds.right,bounds.top,false);//東北經緯度坐標 
		var north_west = new PG.Point(bounds.left,bounds.top,false);//西北經緯度坐標 		
		var south_east = new PG.Point(bounds.right,bounds.bottom,false);//東南經緯度坐標		 
		var m1=new PG.Point((north_west.x+south_west.x)/2,(north_west.y+south_west.y)/2,false);
		var m2=new PG.Point((south_west.x+south_east.x)/2,(south_west.y+south_east.y)/2,false);
		var m3=new PG.Point((south_east.x+north_east.x)/2,(south_east.y+north_east.y)/2,false);
		var m4=new PG.Point((north_east.x+north_west.x)/2,(north_east.y+north_west.y)/2,false);
		
		var ps = [north_west,m1,south_west,m2,south_east,m3,north_east,m4];		
		if(this.dragPoints.length==0){
			var borderC=this.GetLineColor();
			for(var i=0;i<ps.length;i++){
				this.dragPoints.push(PG.RectEntity.getIconObj(ps[i],this.dpsoffset[i],borderC,"#ffffff",1));	
				this.map.AddEntity(this.dragPoints[i]);
				this.dragPoints[i].icon.img.style.cursor = 'pointer';
				this.dragPoints[i].id=i;
			}
		}else if(isCreate){
			for(var i=0;i<ps.length;i++){
				this.map.AddEntity(this.dragPoints[i]);
			}
		}else if(ids){
			for(var i=0;i<ids.length;i++){
				this.dragPoints[ids[i]].SetPoint(ps[ids[i]]);
			}
		}else{
			for(var i=0;i<ps.length;i++){
				this.dragPoints[i].SetPoint(ps[i]);
			}
		}		
	};

	/**
		得到編輯點對像
	*/
	PG.RectEntity.getIconObj=function(point,offsets,borderColor,bgColor,alpha){
		var divIcon=document.createElement("div");
		PG.Tool.setCssText(divIcon,"border:1px solid "+borderColor+";background:"+bgColor+";line-height:0px;font-size:0px;width:100%;height:100%");
		if(PG.Tool.browserInfo().isIE){
			divIcon.style.filter="alpha(opacity="+alpha*100+")";
		}else{
			divIcon.style.opacity=alpha;
		}
		var postMarker=new PG.MarkEntity(point,new PG.DivIcon(divIcon,new PG.Size(12,12),new PG.Point(offsets[0],offsets[1])));
		return postMarker;
	};

	/**
		開始拖動

		矩形編輯有兩種情況:
		1,拖動編輯點
		2,拖動整個矩形
		對這兩種情況分別綁定函數進行處理
	*/
	PG.RectEntity.prototype.startDrag = function(){
		if(!this.listeners){this.listeners = [];}
		if(!this.mapBd){
			this.mapBd = new PG.Rect(0,this.map.viewSize[1],this.map.viewSize[0],0);
		}

		for(var i=0;i<this.dragPoints.length;i++){
			this.dragPoints[i].enableDrag();
			this.listeners.push(PG.Event.addListener(this.dragPoints[i],"OnDrag",this.onDragDivMd(this)));
			this.listeners.push(PG.Event.addListener(this.dragPoints[i],"OnDragEnd",this.onDragDivMu(this)));
		}		
		this.listeners.push(PG.Event.bind(this.div,"mousedown",this,this.onBdDivMd));//位置拖動
	};

	/**
		當編輯矩形時,按下編輯點時觸發的函數

		編輯點的順序：從左上角開始,逆時針(id從0到7)
	*/
	PG.RectEntity.prototype.onDragDivMd=function(rect){
		return function(lnglat){
			this.map.DisableDrag();

			var north_west = rect.dragPoints[0].point;//西北經緯度坐標  
			var south_west = rect.dragPoints[2].point;//西南經緯度坐標
			var south_east = rect.dragPoints[4].point;//東南經緯度坐標
			var north_east = rect.dragPoints[6].point;//東北經緯度坐標 		
			
			var _bounds  = null;
			var _ids = null;
			switch(this.id){
				case 0://left top
					south_west = new PG.Point(lnglat.x,south_east.y,false);
					north_east = new PG.Point(south_east.x,lnglat.y,false);
					rect.dragPoints[this.id].SetPoint(lnglat);
					rect.dragPoints[2].SetPoint(south_west);
					rect.dragPoints[6].SetPoint(north_east);
					_ids=[1,3,5,7];
					_bounds  = rect.calPtBounds([south_west,north_east,south_east,lnglat]);
					break;
				case 1://left middle					
					north_west = new PG.Point(lnglat.x,north_east.y,false);
					south_west = new PG.Point(lnglat.x,south_east.y,false);
					rect.dragPoints[0].SetPoint(north_west);
					rect.dragPoints[2].SetPoint(south_west);
					rect.dragPoints[1].SetPoint(new PG.Point(north_west.x,(north_west.y+south_east.y)/2,false));
					rect.dragPoints[5].SetPoint(new PG.Point(north_east.x,rect.dragPoints[1].point.y,false));
					_ids=[3,7];
					_bounds = rect.calPtBounds([south_west,north_east,south_east,north_west]);
					break;
				case 2://left bottom					
					north_west = new PG.Point(lnglat.x,north_east.y,false);
					south_east = new PG.Point(north_east.x,lnglat.y,false);
					rect.dragPoints[this.id].SetPoint(lnglat);
					rect.dragPoints[0].SetPoint(north_west);
					rect.dragPoints[4].SetPoint(south_east);
					_ids=[1,3,5,7];
					_bounds  = rect.calPtBounds([north_west,south_east,north_east,lnglat]);
					break;
				case 3://bottom center
					south_east = new PG.Point(north_east.x,lnglat.y,false);
					south_west = new PG.Point(south_west.x,lnglat.y,false);
					rect.dragPoints[2].SetPoint(south_west);
					rect.dragPoints[4].SetPoint(south_east);
					rect.dragPoints[3].SetPoint(new PG.Point((south_east.x+south_west.x)/2,lnglat.y,false));
					rect.dragPoints[7].SetPoint(new PG.Point(rect.dragPoints[3].point.x,north_west.y,false));

					_ids=[1,5];
					_bounds  = rect.calPtBounds([south_west,north_east,south_east,north_west]);
					break;
				case 4://right bottom					
					south_west = new PG.Point(north_west.x,lnglat.y,false);
					north_east = new PG.Point(lnglat.x,north_west.y,false); 
					rect.dragPoints[this.id].SetPoint(lnglat);
					rect.dragPoints[2].SetPoint(south_west);
					rect.dragPoints[6].SetPoint(north_east);
					_ids=[1,3,5,7];
					_bounds  = rect.calPtBounds([south_west,north_east,north_west,lnglat]);					
					break;
				case 5://right middle
					north_east = new PG.Point(lnglat.x,north_west.y,false);
					south_east = new PG.Point(lnglat.x,south_west.y,false);
					rect.dragPoints[4].SetPoint(south_east);
					rect.dragPoints[6].SetPoint(north_east);
					rect.dragPoints[5].SetPoint(new PG.Point(north_east.x,(north_east.y+south_east.y)/2,false));
					rect.dragPoints[1].SetPoint(new PG.Point(north_west.x,rect.dragPoints[5].point.y,false));
					_ids=[3,7];
					_bounds  = rect.calPtBounds([south_west,north_east,south_east,north_west]);
					break;
				case 6://top right
					north_west = new PG.Point(south_west.x,lnglat.y,false);
					south_east = new PG.Point(lnglat.x,south_west.y,false);
					rect.dragPoints[this.id].SetPoint(lnglat);
					rect.dragPoints[0].SetPoint(north_west);
					rect.dragPoints[4].SetPoint(south_east);
					_ids=[1,3,5,7];
					_bounds  = rect.calPtBounds([north_west,south_east,south_west,lnglat]);					
					break;
				case 7://top center
					north_east = new PG.Point(south_east.x,lnglat.y,false);
					north_west = new PG.Point(south_west.x,lnglat.y,false);
					rect.dragPoints[0].SetPoint(north_west);
					rect.dragPoints[6].SetPoint(north_east);
					rect.dragPoints[7].SetPoint(new PG.Point((north_east.x+north_west.x)/2,lnglat.y,false));
					rect.dragPoints[3].SetPoint(new PG.Point(rect.dragPoints[7].point.x,south_west.y,false));
					_ids=[1,5];
					_bounds  = rect.calPtBounds([south_west,north_east,south_east,north_west]);
					break;
				default:
					break;
			}
			var new_bounds = new PG.Rect(_bounds[0],_bounds[3],_bounds[2],_bounds[1],false);
			rect.SetBounds(new_bounds);
			rect.startEdit(false,_ids)//重置編輯點位置
		}
	};

	/**
		拖動編輯點時根據四角坐標重新計算範圍
	*/
	PG.RectEntity.prototype.calPtBounds=function(points){
		var xi = points[0].x;
		var yi = points[0].y;
		var xa = points[0].x;
		var ya = points[0].y;
		var lng=0,lat=0;
		for(var i=1;i<points.length;i++){
			lng=points[i].x;
			lat=points[i].y;
			if(lng<xi){xi = lng;}else if(lng>xa){xa = lng;}
			if(lat<yi){yi = lat;}else if(lat>ya){ya = lat;}			
		}
		return [xi,yi,xa,ya];
	};

	/**
		當編輯矩形時,放開按下的編輯點時觸發的函數
	*/
	PG.RectEntity.prototype.onDragDivMu=function(rect){
		return function(e){
			PG.Event.cancelBubble(e);
			if(document.releaseCapture)
			{
				document.releaseCapture();
			}
			this.map.EnableDrag();
			rect.endEdit();//徐金評添加
		}
	};

	/**
		當編輯矩形時,拖動矩形執行的函數
	*/
	PG.RectEntity.prototype.onBdDivMd=function(e){
		PG.Event.cancelBubble(e);
		this.bgListeners = [
				PG.Event.bind(document,"mousemove",this,this.onBdDivMm),
				PG.Event.bind(document,"mouseup",this,this.onBdDivMu)
			];
		this.moveObject = {};
		this.moveObject.startPoint = PG.RectEntity.getPos(e,this.map.container);
		this.oldBd = this.M2Px(this.bounds);
	};

	/**
		當編輯矩形時,拖動矩形執行的函數
	*/
	PG.RectEntity.prototype.onBdDivMm=function(e){
		PG.Event.cancelBubble(e);
		var cp = PG.RectEntity.getPos(e,this.map.container);
		var sp = this.moveObject.startPoint;
		var offset = [cp[0]-sp[0],cp[1]-sp[1]];
		var obd = this.oldBd;
		var cbd = this.M2Px(this.GetBounds());
		var xi = obd.left+offset[0];
		var xa = obd.right+offset[0];
		var yi = obd.bottom+offset[1];
		var ya = obd.top+offset[1];
		var wth = xa - xi;
		var hth = ya - yi;
		var newbd = new PG.Rect(xi,ya,xa,yi);		
		if(xi<=this.mapBd.XminMercator){
			newbd.SetLeft(this.mapBd.left);
			newbd.SetRight(this.mapBd.left + wth);
		}
		if(xa>=this.mapBd.XmaxMercator){
			newbd.SetLeft(this.mapBd.right - wth);
			newbd.SetRight(this.mapBd.right);
		}
		if(yi<=this.mapBd.YminMercator){
			newbd.SetBottom(this.mapBd.bottom);
			newbd.SetTop(this.mapBd.bottom + hth);
		}
		if(ya>=this.mapBd.YmaxMercator){
			newbd.SetBottom(this.mapBd.top - hth);
			newbd.SetTop(this.mapBd.top);
		}
		this.SetBounds(this.Px2M(newbd));
		this.startEdit();//重置編輯點位置
	};

	/**
		刪除在容器中按下鼠標時綁定的事件
	*/
	PG.RectEntity.prototype.onBdDivMu=function(e){
		PG.Event.cancelBubble(e);		
		var tp;
		while(tp = this.bgListeners.pop()){
			PG.Event.removeListener(tp);
		}
		this.endEdit();//徐金評添加
	};

	/**
		墨卡托經緯度範圍轉像素範圍
	*/
	PG.RectEntity.prototype.M2Px = function(b){
		var lb = this.map.fromLatLngToContainerPixel(new PG.Point(b.left,b.bottom,false));
		var rt = this.map.fromLatLngToContainerPixel(new PG.Point(b.right,b.top,false));
		return new PG.Rect(lb[0],rt[1],rt[0],lb[1]);
	};

	/**
		像素範圍轉墨卡托經緯度範圍
	*/
	PG.RectEntity.prototype.Px2M = function(b){
		var lb = this.map.fromContainerPixelToLatLng(new PG.Point(b.left,b.top));
		var rt = this.map.fromContainerPixelToLatLng(new PG.Point(b.right,b.bottom));
		return new PG.Rect(lb.x,lb.y,rt.x,rt.y,false);
	};

	/**
		觸發點在容器中的坐標[left,top]
	*/
	PG.RectEntity.getPos = function(e,container){
		var offset=PG.Tool.getPageOffset(container);
		var epos = PG.RectEntity.pointXY(e);
		return [epos[0]-offset[0],epos[1]-offset[1]];
	};

	/**
		觸發點在document中的坐標[left,top]
	*/
	PG.RectEntity.pointXY = function(event){
		var x = event.pageX || (event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)); 
		var y = event.pageY || (event.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
	    return [x,y];
	};

	/**
		橢圓
	*/
	function EllipseEntity(bounds,color,bgcolor,weight,opacity)
	{
		var overlay=new PG.RectEntity(bounds,color,bgcolor,weight,opacity,PG.EllipseEntity.create);
		overlay.type = window.PG.ENTITY_ELLIPSE;
		return overlay;
	}
	PG.EllipseEntity = EllipseEntity;

	/**
		創建橢圓
		IE下用VML技術,否則用SVG技術
	*/
	PG.EllipseEntity.create=function()
	{
		this.draw=PG.EllipseEntity.draw;
		this.SetLineColor=PG.EllipseEntity.SetLineColor;
		this.SetFillColor=PG.EllipseEntity.SetFillColor;
		this.SetOpacity=PG.EllipseEntity.SetOpacity;
		this.SetLineStroke=PG.EllipseEntity.SetLineStroke;
		this.SetLineStyle=PG.EllipseEntity.SetLineStyle;
		this.GetObject = PG.EllipseEntity.GetObject;
		this.initialize = PG.EllipseEntity.initialize;
		this.reDraw = PG.EllipseEntity.reDraw;
		this.expandDrawBounds = PG.EllipseEntity.expandDrawBounds;
		if(PG.BrowserInfo.isIE())
		{
			PG.Tool.loadVmlNamespace();
			this.div=document.createElement("v:oval");
			this.div.unselectable="on";
			this.div.filled=true;
			this.stroke=document.createElement("v:stroke");
			this.div.appendChild(this.stroke);
			this.fill=document.createElement("v:fill");
			this.div.appendChild(this.fill);
		}
		else
		{
			this.svgNamespace = 'http://www.w3.org/2000/svg';
			this.svgroot = document.createElementNS(this.svgNamespace, "svg");
			this.svgroot.setAttributeNS(null,"style","position: absolute;overflow:visible");			
			var svgpath = document.createElementNS(this.svgNamespace, 'ellipse');			
			this.svgroot.appendChild(svgpath);			
			this.div = svgpath;
			this.svgpath=svgpath;
		}
		this.div.style.position="absolute";
	};
	
	/**
		返回容器
	*/
	PG.EllipseEntity.GetObject=function(){
		if(PG.BrowserInfo.isIE()){
			return this.div;
		}else{
			return null;
		}
	};

	/**
		初始化
	*/
	PG.EllipseEntity.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		if(PG.BrowserInfo.isIE()){
			this.map.overlaysDiv.appendChild(this.div);
		}else{
			if(!this.map.polygonLayer){
				this.map.polygonLayer = this.svgroot;
				this.map.overlaysDiv.appendChild(this.svgroot);
			}else{
				this.svgroot = this.map.polygonLayer;
			}
			this.map.polygonLayer.appendChild(this.div);
		}
		this.added=true;
		PG.Event.trigger(this,"init",[]);
	};

	/**
		重繪
	*/
	PG.EllipseEntity.reDraw=function(flag)
	{
		
		//如果不是必須重繪,則不重繪,大部分的標注都不需要每次重繪
		if(!flag){return;}
		
		var bounds=this.map.getBoundsLatLng();
		if(!flag && this.drawBounds && this.drawBounds.IsInclude(bounds)){return;}
		
		//進行重繪,對div進行切割,如果邊框超出就剪掉
		this.drawSpan = this.map.getDrawBounds();
		var lb=this.map.GetRelativeXY(new PG.Point(this.bounds.left,this.bounds.top,false));//取得範圍bounds左上角的坐標
		var rt=this.map.GetRelativeXY(new PG.Point(this.bounds.right,this.bounds.bottom,false));//取得範圍bounds右下角坐標
		this.draw(lb,rt);
		
		this.drawBounds=this.map.getDrawBounds();
		this.drawSpan=new PG.Rect(Math.max(this.drawBounds.left,this.bounds.left),Math.min(this.drawBounds.top,this.bounds.top),Math.min(this.drawBounds.right,this.bounds.right),Math.max(this.drawBounds.bottom,this.bounds.bottom),false);
		if(this.drawSpan.XminMercator>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>this.drawSpan.YmaxMercator)
		{
			if(this.added)
			{
				if(PG.BrowserInfo.isIE()){
					this.map.overlaysDiv.removeChild(this.div);
				}else{
					this.svgroot.removeChild(this.div);
				}
				this.added=false;
			}
			this.expandDrawBounds();
			return;
		}
		else if(!this.added)
		{
			if(PG.BrowserInfo.isIE()){
				this.map.overlaysDiv.appendChild(this.div);
			}else{
				this.svgroot.appendChild(this.div);
			}
			this.added=true;
		}		
		this.expandDrawBounds();
	};

	/**
		繪製橢圓	
	*/
	PG.EllipseEntity.draw=function(lb,rt)
	{
		if(PG.BrowserInfo.isIE())
		{
			PG.Tool.setPosition(this.div,lb);
			PG.Tool.SetSize(this.div,[rt[0]-lb[0],rt[1]-lb[1]]);
		}
		else
		{
			
//		防止svg裡顯示不出完整的線 (webkit內核bug1)
//		防止svg有殘影	(webkit內核bug2)
			var offsetXy=[this.map.maxPixel*2,this.map.maxPixel*2];
			PG.Tool.setPosition(this.svgroot,[-offsetXy[0]/2,-offsetXy[1]/2]);
			var sizeWidth=offsetXy[0];
			var sizeHeight=offsetXy[1];
			this.svgroot.setAttributeNS(null,"width",sizeWidth);
			this.svgroot.setAttributeNS(null,"height",sizeHeight);
			
//			注意safari和chrome有bug   viewBox起始不能設置成負值(當設置opacity的情況下)
			this.svgroot.setAttributeNS(null,"viewBox","0 0"+" "+sizeWidth+" "+sizeHeight);

			this.svgpath.setAttributeNS(null, 'cx', lb[0]+(rt[0]-lb[0])/2 + this.map.maxPixel);
			this.svgpath.setAttributeNS(null, 'cy', lb[1]+(rt[1]-lb[1])/2 + this.map.maxPixel);
			this.svgpath.setAttributeNS(null, 'rx', (rt[0]-lb[0])/2);
			this.svgpath.setAttributeNS(null, 'ry', (rt[1]-lb[1])/2);
			this.svgpath.setAttributeNS(null, 'style', 'fill:'+this.bgcolor+';stroke:'+this.color+';stroke-width:'+this.weight);
		}
	};

	/**
		擴大繪製範圍 
	*/
	PG.EllipseEntity.expandDrawBounds=function()
	{
		var b = window.PG.LEGALLNGLATBOUNDS;
		if(this.bounds.XmaxMercator<this.drawBounds.XmaxMercator)
		{
			this.drawBounds.SetRight(b[1]);
		}
		if(this.bounds.YmaxMercator<this.drawBounds.YmaxMercator)
		{
			this.drawBounds.SetTop(b[3]);
		}
		if(this.bounds.XminMercator>this.drawBounds.XminMercator)
		{
			this.drawBounds.SetLeft(b[0]);
		}
		if(this.bounds.YminMercator>this.drawBounds.YminMercator)
		{
			this.drawBounds.SetBottom(b[2]);
		}
	};

	/**
		設置橢圓形圖形的邊框顏色
	*/
	PG.EllipseEntity.SetLineColor=function(color)
	{
		this.color=color;
		if(PG.BrowserInfo.isIE())
		{
			if(this.color=="transparent" || this.color=="")
			{
				this.div.stroked=false;
			}
			else
			{
				this.div.stroked=true;
				this.div.strokecolor=this.color;
			}
		}
		else
		{
			//this.svgpath.setAttributeNS(null, 'stroke', this.color);
			this.svgpath.style.stroke=this.color;
		}
	};

	/**
		設置橢圓形圖形的背景填充色
	*/
	PG.EllipseEntity.SetFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		if(PG.BrowserInfo.isIE())
		{
			if(this.bgcolor=="transparent" || this.bgcolor=="")
			{
				this.div.filled=false;
			}
			else
			{
				this.div.filled=true;
				this.div.fillcolor=this.bgcolor;
			}
		}
		else
		{
			//this.svgpath.setAttributeNS(null, 'fill', this.bgcolor);
			this.svgpath.style.fill=this.bgcolor;
		}
	};

	/**
		設置橢圓形圖形的透明度
	*/
	PG.EllipseEntity.SetOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(PG.BrowserInfo.isIE())
		{
			this.stroke.opacity=this.opacity;
			this.fill.opacity=this.opacity;
		}
		else
		{
			this.svgpath.setAttributeNS(null, 'opacity', this.opacity);
//			svg可單獨設置填充透明度
//			this.svgpath.setAttributeNS(null, 'fill-opacity', this.opacity);
		}
	};

	/**
		設置橢圓形圖形的邊框線寬
	*/
	PG.EllipseEntity.SetLineStroke=function(weight)
	{
		this.weight=weight;
		if(PG.BrowserInfo.isIE())
		{
			this.div.strokeweight=this.weight;
		}
		else
		{
			//this.svgpath.setAttributeNS(null, 'stroke-width', this.weight);
			this.svgpath.style.strokeWidth=this.weight;
		}
	};

	/**
		設置邊框的顯示線型
		有以下幾種類型:Solid(實線,默認值),Dot(點線),Dash(折線)(目前僅IE支持)
	*/
	PG.EllipseEntity.SetLineStyle=function(style)
	{
		if(!style){return;}
		this.lineStyle=style;
		if(PG.BrowserInfo.isIE())
		{
			this.stroke.dashstyle=style;
		}
	};

	window.PG.RectEntity=PG.RectEntity;
	window.PG.EllipseEntity=PG.EllipseEntity;
}
NSRectEntity();