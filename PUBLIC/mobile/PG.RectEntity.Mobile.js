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
		this.minWH=[10,10];//最小宽高

		this.color=(color||color=="")?color:"blue";
		this.bgcolor=(bgcolor||bgcolor=="")?color:"#99FFCC";
		this.weight=(weight||weight==0)?weight:3;
		this.opacity=(opacity||opacity==0)?opacity:0.5;
		this.type = window.PG.ENTITY_RECT;
		this.create();	
		this.dragPoints=[];//編輯點			xujinping
		this.dpsoffset=[];//編輯點Icon偏移	xujinping
		this.listeners=[];
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
		this.div = document.createElement('CANVAS');
		this.div.style.position="absolute";
		PG.Tool.setUnSelectable(this.div);
		PG.Event.bind(this.div,"touchstart",this,this.onMouseDown);
			
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
		this.add=true;
		PG.Event.trigger(this,"init",[]);
	};

	/**
			
	*/
	PG.RectEntity.prototype.ptop = function(){	
		var p1 = new PG.Point(this.bounds.left,this.bounds.bottom,false);//西南经纬度坐标  
        var p2 = new PG.Point(this.bounds.right,this.bounds.top,false);//东北经纬度坐标  
        var p3 = new PG.Point(this.bounds.left,this.bounds.top,false);//西北经纬度坐标  
        var p4 = new PG.Point(this.bounds.right,this.bounds.bottom,false);//东南经纬度坐标
		var ps = [p3,p2,p4,p1];
		this.px_points = [];
		for(var i=0;i<ps.length;i++){
			var p = this.map.GetRelativeXY(ps[i]);
			this.px_points.push([p.x,p.y]);		
		}
	};

	/**
		重新绘制
		noredraw  :是否重新绘制的参数,当拖动时,可以不需要重新绘制,只要重新设置位置就可以了
				  这样可以提高性能
		---徐金评2012-9-4	
	*/
	PG.RectEntity.prototype.reDraw=function(flag,noredraw)
	{		
		var bounds=this.map.getBoundsLatLng();
		if(!flag && this.drawBounds && this.drawBounds.IsInclude(bounds)){return;}
		this.drawBounds=this.map.getDrawBounds();
		this.drawSpan=new PG.Rect(Math.max(this.drawBounds.left,this.bounds.left),Math.min(this.drawBounds.top,this.bounds.top),Math.min(this.drawBounds.right,this.bounds.right),Math.max(this.drawBounds.bottom,this.bounds.bottom),false);
		if(this.drawSpan.XminMercator>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>this.drawSpan.YmaxMercator)
		{
			if(this.added)
			{
				this.div.parentNode.removeChild(this.div);
				this.added=false;
			}
			this.expandDrawBounds();
			return;
		}
		else if(!this.added)
		{
			this.map.overlaysDiv.appendChild(this.div);
			this.added=true;
		}
		
		//计算canvas元素的大小---徐金评2012-8-28
		var l = this.drawSpan.left;
		var b = this.drawSpan.top;
		var r = this.drawSpan.right;
		var t = this.drawSpan.bottom;
		var lb=this.map.GetRelativeXY(new PG.Point(l,b,false));//取得范围bounds左上角的坐标
		var rt=this.map.GetRelativeXY(new PG.Point(r,t,false));//取得范围bounds右下角坐标
		
		PG.Tool.setPosition(this.div,[lb[0]+2,lb[1]]);

		if(!noredraw){
			this.ptop();
			
			var w = rt[0]-lb[0]+5;//添加5个像素,确保线型完全绘制
			var h = rt[1]-lb[1]+5;//添加5个像素,确保线型完全绘制
			w = w>this.minWH[0]?w:this.minWH[0];
			h = h>this.minWH[1]?h:this.minWH[1];

			var cxt = this.div.getContext('2d');
		
			//清除原来绘制的线条
			cxt.clearRect(0,0,parseInt(this.div.width),parseInt(this.div.height));

			this.div.width = w;
			this.div.height = h;
			PG.Tool.SetSize(this.div,[w,h]);

			
			var o = Math.round(this.weight/2);
		
			cxt.clearRect(0,0,w,h);

			var ps = this.px_points;
			cxt.beginPath(); 
			cxt.moveTo(ps[0][0]-lb[0]+o,ps[0][1]-lb[1]+o);    
			for (var i = 1; i < ps.length; i++){
				cxt.lineTo(ps[i][0]-lb[0]+o,ps[i][1]-lb[1]+o);
			}

			cxt.lineCap = 'round';
			cxt.lineJoin = 'round';
			cxt.strokeStyle = this.color;
			cxt.lineWidth = this.weight;
			cxt.globalAlpha = this.opacity;		
			cxt.fillStyle = this.bgcolor;
				
			cxt.closePath();
			cxt.fill();
			cxt.stroke();

		}			

		this.expandDrawBounds();
	};

	/**
		扩展绘制范围
	*/
	PG.RectEntity.prototype.expandDrawBounds=function()
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
		返回容器			
	*/
	PG.RectEntity.prototype.GetObject=function(){return this.div;};

	/**
		刪除	
		此段代碼解決IE下能自動移除,而其他瀏覽器需要調用removeChild方法移除
	*/
	PG.RectEntity.prototype.remove=function()
	{
		if(this.div.parentNode){
			this.div.parentNode.removeChild(this.div);
		}
		this.added=false;
		this.map=null;
	};

	/**
		銷毀 			
	*/
	PG.RectEntity.prototype.depose=function()
	{
		PG.Event.deposeNode(this.div);
		this.added=false;
		this.div=null;
		this.bounds=null;
		this.map=null;
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
		if(this.map)
		{
			this.reDraw(true);
		}
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
		if(this.map)
		{
			this.reDraw(true);
		}
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
		if(this.map)
		{
			this.reDraw(true);
		}
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
		if(this.map)
		{
			this.reDraw(true);
		}
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
		this.lineStyle=style;
	};	

	/**
		啟動編輯功能

	*/
	PG.RectEntity.prototype.EnableEdit = function(){
		this._eEdit = true;
		PG.Tool.setZIndex(this.div,520);
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
		PG.Tool.setZIndex(this.div,500);
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
		for(var i=0;i<this.listeners.length;i++){
			PG.Event.removeListener(this.listeners[i]);
		}
		this.listeners = [];
		for(var i=0;i<this.dragPoints.length;i++){
			this.map.RemoveEntity(this.dragPoints[i]);
		}
		if(this.type==PG.ENTITY_ELLIPSE){
			this.SetBounds(this.bounds);
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
				//不添加中间编辑点,否则编辑点太多不好操作 
				//if(i%2==0){this.map.AddEntity(this.dragPoints[i]);}
				this.map.AddEntity(this.dragPoints[i]);
				this.dragPoints[i].id=i;
				this.dragPoints[i].zIndexs[1]=530;
				PG.Tool.setZIndex(this.dragPoints[i].div,530);
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
		divIcon.style.opacity=alpha;
		var postMarker=new PG.MarkEntity(point,new PG.DivIcon(divIcon,new PG.Size(50,50),new PG.Point(offsets[0],offsets[1])));
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
		if(!this.mapBd){
			this.mapBd = new PG.Rect(0,this.map.viewSize[1],this.map.viewSize[0],0);
		}
		for(var i=0;i<this.dragPoints.length;i++){
			this.dragPoints[i].enableDrag();
			this.listeners.push(PG.Event.addListener(this.dragPoints[i],"OnDrag",this.onDragDivMd(this)));
			this.listeners.push(PG.Event.addListener(this.dragPoints[i],"OnDragEnd",this.onDragDivMu(this)));
		}	
		this.listeners.push(PG.Event.bind(this.div,"touchmove",this,this.onDrag));
		this.listeners.push(PG.Event.bind(this.div,"touchend",this,this.onMouseUp));
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
					_bounds  = rect.calPtBounds([south_west,north_east,south_east,north_west]);
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
			this.map.EnableDrag();
			rect.endEdit();//徐金評添加			
		}
	};

	/**
		编辑功能---整体拖动
	*/
	PG.RectEntity.prototype.onMouseDown = function(e){		
		if(this._eEdit){PG.Event.cancelBubble(e);}
		if(!this.map){return;}
		var p=PG.Tool.getEventPosition(e,this.map.container);	
		this._end_p = new PG.Point(p[0],p[1]);		
		PG.Event.trigger(this,"OnClick",[this._end_p]);
		if(this._eEdit)
		{	
			this.moveObject={};
			this.moveObject.startPoint = PG.RectEntity.getPos(e,this.map.container);
			this.oldBd = this.M2Px(this.bounds);
			this.mapBd = new PG.Rect(0,0,this.map.viewSize[0],this.map.viewSize[1]);			
		}
	};

	/**
		鼠标拖动时触发			
	*/
	PG.RectEntity.prototype.onDrag=function(e)
	{
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
		var p=PG.Tool.getEventPosition(e,this.map.container);	
		this._end_p = new PG.Point(p[0],p[1]);
		PG.Event.trigger(this,'OnEdit',[this._end_p]);
	};

	/**
		鼠标结束拖动时触发			
	*/
	PG.RectEntity.prototype.onMouseUp=function(e)
	{
		PG.Event.cancelBubble(e);
		this.reDraw(true);
		PG.Event.trigger(this,'OnEditEnd',[this._end_p]);
	};

	/**
		墨卡托經緯度範圍轉像素範圍
	*/
	PG.RectEntity.prototype.M2Px = function(b){
		var lb = this.map.WorldToWindow(new PG.Point(b.left,b.bottom,false));
		var rt = this.map.WorldToWindow(new PG.Point(b.right,b.top,false));
		return new PG.Rect(lb[0],rt[1],rt[0],lb[1]);
	};

	/**
		像素範圍轉墨卡托經緯度範圍
	*/
	PG.RectEntity.prototype.Px2M = function(b){
		var lb = this.map.WindowToWorld(new PG.Point(b.left,b.top));
		var rt = this.map.WindowToWorld(new PG.Point(b.right,b.bottom));
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
		event=event.touches&&event.touches[0]?event.touches[0]:event;
		var x = event.pageX || (event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)); 
		var y = event.pageY || (event.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
	    return [x,y];
	};

	/**
		橢圓
	*/
	function EllipseEntity(bounds,color,bgcolor,weight,opacity)
	{
		var p=new PG.RectEntity(bounds,color,bgcolor,weight,opacity);
		p.type = window.PG.ENTITY_ELLIPSE;
		p.reDraw=PG.EllipseEntity.reDraw;
		return p;
	}
	PG.EllipseEntity = EllipseEntity;

	/**
		重繪
	*/
	PG.EllipseEntity.reDraw=function(flag,noredraw)
	{		
		//如果不是必須重繪,則不重繪,大部分的標注都不需要每次重繪
		if(!flag){return;}
		
		var bounds=this.map.getBoundsLatLng();
		if(!flag && this.drawBounds && this.drawBounds.IsInclude(bounds)){return;}
		
		//進行重繪,對div進行切割,如果邊框超出就剪掉
		this.drawSpan = this.map.getDrawBounds();
		var lb=this.map.GetRelativeXY(new PG.Point(this.bounds.left,this.bounds.top,false));//取得範圍bounds左上角的坐標
		var rt=this.map.GetRelativeXY(new PG.Point(this.bounds.right,this.bounds.bottom,false));//取得範圍bounds右下角坐標
		
		
		this.drawBounds=this.map.getDrawBounds();
		this.drawSpan=new PG.Rect(Math.max(this.drawBounds.left,this.bounds.left),Math.min(this.drawBounds.top,this.bounds.top),Math.min(this.drawBounds.right,this.bounds.right),Math.max(this.drawBounds.bottom,this.bounds.bottom),false);
		if(this.drawSpan.XminMercator>this.drawSpan.XmaxMercator|| this.drawSpan.YminMercator>this.drawSpan.YmaxMercator)
		{
			if(this.added)
			{
				this.map.overlaysDiv.removeChild(this.div);
				this.added=false;
			}
			this.expandDrawBounds();
			return;
		}
		else if(!this.added)
		{
			this.map.overlaysDiv.appendChild(this.div);
			this.added=true;
		}		
		
		//计算canvas元素的大小---徐金评2012-8-28
		var l = this.drawSpan.left;
		var b = this.drawSpan.top;
		var r = this.drawSpan.right;
		var t = this.drawSpan.bottom;
		var lb=this.map.GetRelativeXY(new PG.Point(l,b,false));//取得范围bounds左上角的坐标
		var rt=this.map.GetRelativeXY(new PG.Point(r,t,false));//取得范围bounds右下角坐标

		PG.Tool.setPosition(this.div,lb);	
		
		if(!noredraw){
			var w = rt[0]-lb[0];
			var h = rt[1]-lb[1];
			var o = Math.round(this.weight/2);
			var rx = w/2-o-this.weight;//椭圆的长半轴
			var ry = h/2-o;//椭圆的短半轴
			w = w>this.minWH[0]?w:this.minWH[0];
			h = h>this.minWH[1]?h:this.minWH[1];		
					
			this.div.width = w+this.weight;
			this.div.height = h+this.weight;
			PG.Tool.SetSize(this.div,[w+this.weight,h+this.weight]);

			var cxt = this.div.getContext('2d');	
			//cxt.clearRect(0,0,parseInt(this.div.width),parseInt(this.div.height));
		
			var x = w/2+this.weight+2;	//椭圆的中心点---X轴
			var y = h/2+this.weight;	//椭圆的中心点---Y轴
			
			var EToBConst = 2/3*(Math.sqrt(2)-1);
			var offsetX = rx*2*EToBConst;
			var offsetY = ry*2*EToBConst;
			var maxX = x + rx;
			var minX = x - rx;
			var maxY = y + ry;
			var minY = y - ry;

			cxt.moveTo(minX, y);
			cxt.bezierCurveTo(minX, y - offsetY, x - offsetX, minY, x, minY);
			cxt.bezierCurveTo(x + offsetX, minY, maxX, y - offsetY, maxX, y);
			cxt.bezierCurveTo(maxX, y + offsetY, x + offsetX, maxY, x, maxY);
			cxt.bezierCurveTo(x - offsetX, maxY, minX, y + offsetY, minX, y);	

			cxt.lineCap = 'round';
			cxt.strokeStyle = this.color;
			cxt.lineWidth = this.weight;
			cxt.globalAlpha = this.opacity;
			cxt.fillStyle = 'red';

			cxt.closePath();
			cxt.stroke();
		}	
		this.expandDrawBounds();
	};	

	window.PG.RectEntity=PG.RectEntity;
	window.PG.EllipseEntity=PG.EllipseEntity;
}
NSRectEntity();