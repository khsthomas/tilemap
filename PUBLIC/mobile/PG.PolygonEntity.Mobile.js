/**
	本文件是JS API之中的PG.PolygonEntity,PG.PolylineEntity類

*/
function MapNSPolygonEntity()
{
	/**
		面對像

		points		用來繪製多邊形的各頂點數組
		color		表示多邊形的邊框顏色,默認為blue
		bgcolor		表示多邊形的背景填充色,默認為#99FFCC
		weight		表示多邊形的邊框顯示寬度,以像素為單位,默認為3
		opacity		表示多邊形的顯示的透明度,範圍為0-1,越小表示越透明,默認為0.5
	*/
	function PolygonEntity(points,color,bgcolor,weight,opacity)
	{		
		PG.Tool.inherit(this,PG.Entity);
		PG.Tool.inherit(this,PG.PolygonEntity.prototype);
        this.type = window.PG.ENTITY_POLYGON;
		this.minWH=[10,10];//最小宽高

		this.points=points;
		this.color=(color||color=="")?color:"#0000FF";
		this.bgcolor=(bgcolor||bgcolor=="")?bgcolor:"#99FFCC";
		this.weight=(weight||weight==0)?weight:3;
		this.opacity=(opacity||opacity==0)?opacity:0.45;
		this.lineArrow=["None","None"];
		
		this.countBounds();
		this.create();	
		this.dragMarkerSize=new PG.Size(20,20);
	}
	PG.PolygonEntity = PolygonEntity;

	/**
		返回疊加物類型		
	*/
	PG.PolygonEntity.prototype.GetType = function(){	
		return this.type;
	};

	/**
		得到像素坐标并升序排序(若经度相等,则按照纬度排序)		
	*/
	PG.PolygonEntity.prototype.ptop = function(){	
		this.px_points = [];
		this.lngsame = true;//判断所有的经度是否相同
		this.latsame = true;//判断所有的纬度是否相同
		var len = this.points.length;
		for(var i=0;i<len;i++){
			var m = this.points[i];
			var p = this.map.GetRelativeXY(m);
			this.px_points.push([p.x,p.y]);
			if(i<len-1){
				var p1 = this.points[i+1].x;
				var p2 = this.points[i+1].y;
				if(this.lngsame&&(p1!=m.x)){
					this.lngsame = false;
				}
				if(this.latsame&&(p2!=m.y)){
					this.latsame = false;
				}
			}
		}
		//升序排序
		/*
			this.px_points.sort(function(b,c){
				if(b[0]>c[0]){return 1;}else if(b[0]==c[0]){if(b[1]>c[1]){return 1;}else if(b[1]==c[1]){return 0;}}
				return -1;
			});
		*/		
	};

	/**
		創建面

	*/
	PG.PolygonEntity.prototype.create=function()
	{		
		this.div = document.createElement('CANVAS');
		this.div.style.position="absolute";
		PG.Tool.setUnSelectable(this.div);
		PG.Event.bind(this.div,"touchstart",this,this.onMouseDown);
	};
		
	/**
		判斷一個經緯度點是否在面範圍之內	
		
		射線判別法

		如果一個點在多邊形內部，任意角度做射線肯定會與多邊形要麼有一個交點，要麼有與多邊形邊界線重疊。
		如果一個點在多邊形外部，任意角度做射線要麼與多邊形有一個交點，要麼有兩個交點，要麼沒有交點，要麼有與多邊形邊界線重疊。
		利用上面的結論，我們只要判斷這個點與多邊形的交點個數，就可以判斷出點與多邊形的位置關係了。

		注意事項:

		l 射線跟多邊形的邊界線重疊的情況
		l 區別內部點和外部點的射線在有一個交點時的情況
		對於第一個注意事項，可以將射線角度設為零度，這樣子只需要判斷兩個相鄰頂點的Y值是否相等即可。然後再判斷這個點的X值方位。
		對於第二個注意事項，網上許多文章都說到做射線以後交點為奇數則表示在多邊形內部，這是一個錯誤的觀點，不僅對於凹多邊形不成立，對於凸多邊形也不成立。

		例如：從外部點做射線剛好經過一頂點，這樣子交點個數就為奇數，但是該點卻不在多邊形內部。
		至於要如何區分這兩種情況，用了一個不完美的方法，外部點的射線跟多邊形有一個交點的時候，該交點肯定為頂點，如果該射線上移一位或者下移一位，要麼變成有兩個交點要麼沒有交點。
		當然為了安全起見，這裡把射線盡量往相鄰點中心移動。這樣子就能夠判斷出是外部點的射線跟多邊形有一個交點。
		不過這個方法並不完美，因為有了移位操作，可能會把內部點移動出外部。而且如果判斷點在(60,30)位置，判斷的時候先遇到(20,30)，然後移位操作，就判斷就出錯了。
		為了解決這些問題，在起初先掃瞄一次判斷點是否在頂點上雖然影響了一點效率，而且當判定點距離多邊形一個單位時，判斷可能會有誤。不過只要不是需要高精度的話，這個方法還是很有效的。
		
		pt  :PG.Point

	*/
	PG.PolygonEntity.prototype.ContainsPoint = function(pt){
		if(!pt){return false;}
		if((pt.type!=window.PG.GEO_POINT)&&(pt.nowrap!=false)){return false;}
		var i,j;
		var inside,redo;
		var polygon = this.points;
		var N = polygon.length;	
		redo = true;
		for(i = 0;i < N;++i)
		{
			if(polygon[i].x == pt.x && polygon[i].y == pt.y )
			{ // 是否在頂點上
				redo = false;
				inside = true;
				break;
			}
		}

		while(redo)
		{
			redo = false;
			inside = false;
			for(i = 0,j = N - 1;i < N;j = i++) 
			{
				if((polygon[i].y < pt.y && pt.y < polygon[j].y)||(polygon[j].y < pt.y && pt.y < polygon[i].y)) 
				{
					if(pt.x <= polygon[i].x || pt.x <= polygon[j].x) 
					{
						var _x = (pt.y-polygon[i].y)*(polygon[j].x-polygon[i].x)/(polygon[j].y-polygon[i].y)+polygon[i].x;
						if(pt.x < _x){inside = !inside;}
						else if(pt.x == _x)   
						{
							inside = true;
							break;
						}
					}
				}
				else if(pt.y == polygon[i].y) 
				{
					if (pt.x < polygon[i].x)   
					{
						if(polygon[i].y > polygon[j].y){--pt.y;}else{++pt.y;}
						redo = true;
						break;
					}
				}
				else if(polygon[i].y == polygon[j].y && pt.y == polygon[i].y&&((polygon[i].x < pt.x && pt.x < polygon[j].x)||(polygon[j].x < pt.x && pt.x < polygon[i].x)))
				{
					inside = true;
					break;
				}
			}
		}
		return inside;
	};

	/**
		
	*/
	PG.PolygonEntity.prototype.countBounds=function()
	{
		this.bounds=PG.Rect.GetPointsBounds(this.points);		
	};

	/**
		初始化
	*/
	PG.PolygonEntity.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.added=true;
		PG.Event.trigger(this,"init",[]);
	};
	
	/**
		重新繪製
		
		一下两个参数主要是为了提高编辑时的性能

		noredraw  : 在整体拖动时,不需要重新绘制
		ptop	  : 在拖动编辑点时不需要重新计算像素坐标	 
	*/
	PG.PolygonEntity.prototype.reDraw=function(flag,noredraw,ptop)
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
			//编辑点拖动的时候不需计算,提高性能
			if(!ptop){this.ptop();}			
			//计算canvas元素的大小---徐金评2012-8-28
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

			var o1 = 0;//经度偏移量
			var o2 = 0;//纬度偏移量
			if(this.lngsame){o1 = Math.round(this.weight/2);}
			if(this.latsame){o2 = Math.round(this.weight/2);}
			
			cxt.clearRect(0,0,w,h);
			var ps = this.px_points;
			cxt.beginPath(); 
			cxt.moveTo(ps[0][0]-lb[0]+o1,ps[0][1]-lb[1]+o2);    
			for (var i = 1; i < ps.length; i++){
				cxt.lineTo(ps[i][0]-lb[0]+o1,ps[i][1]-lb[1]+o2);
			}
			
			/*
				lineCap -- 线条端点样式
				可以有三个cap样式之一：对接、圆、方。除另有规定外，默认为对接

				对接（butt）线帽是默认值，当你使用圆形（round）或是方形（square）的线帽风格时，
				线段的长度会增加，加上一段相当于线段宽度的长度。
				例如，一个长度为200像素，宽度为10像素，有着圆形或是方形线帽风格的线段，
				其最终的线段长度是210像素，因为每个线帽都都往线段的每一端加上了5个像素的长度。
				而一个长度为200像素，宽度为20像素，
				有着圆形或是方形的线帽风格的线段的最终长度是220像素，
				因为每个线帽都往线段每一端加上了10像素的长度。
			*/

			cxt.lineCap = this.lineCap;//butt  round  square
			cxt.strokeStyle = this.color;
			cxt.lineWidth = this.weight;
			cxt.globalAlpha = this.opacity;
			/*
				lineJoin 的属性值决定了图形中两线段连接处所显示的样子。它可以是这三种之一：
				round, bevel 和 miter。默认是 miter。
			*/
			cxt.lineJoin = 'round';//bevel  round  miter
			
			if(this.type == window.PG.ENTITY_POLYGON){
				cxt.fillStyle = this.bgcolor;
				cxt.closePath();
				cxt.fill();
			}
			cxt.stroke();					
		}

		this.expandDrawBounds();
	};

	/**
		擴展繪製範圍
	*/
	PG.PolygonEntity.prototype.expandDrawBounds=function()
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
		返回容器對像
	*/
	PG.PolygonEntity.prototype.GetObject=function(){
		return this.div;
	};

	/**
		刪除
	*/
	PG.PolygonEntity.prototype.remove=function()
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
	PG.PolygonEntity.prototype.depose=function()
	{
		PG.Event.deposeNode(this.div);
		this.div=null;
		this.points=null;
	};

	/**
		獲取多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.GetLineColor=function()
	{
		return this.color;
	};

	/**
		獲取多邊形的邊框線寬
	*/
	PG.PolygonEntity.prototype.GetLineStroke=function()
	{
		return this.weight;
	};

	/**
		返回創建此面的經緯度數組
	*/
	PG.PolygonEntity.prototype.getPoints=function()
	{
		return this.points;
	};

	/**
		返回創建此面的經緯度數組
	*/
	PG.PolygonEntity.prototype.GetPoints = function(){
		return this.getPoints();
	};

	/**
		設置多邊形的頂點數組
	*/
	PG.PolygonEntity.prototype.SetPoints = function(lls){
		this.setPoints(lls);
	};

	/**
		設置多邊形的頂點數組
	*/
	PG.PolygonEntity.prototype.setPoints=function(points)
	{
		this.points=points;
		this.countBounds();
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.GetLineColor=function()
	{
		return this.color;
	};

	/**
		設置多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.SetLineColor=function(color)
	{
		this.color=color;
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取多邊形的背景填充色
	*/
	PG.PolygonEntity.prototype.GetFillColor=function()
	{
		return this.bgcolor;
	};

	/**
		設置多邊形的邊框顏色
	*/
	PG.PolygonEntity.prototype.SetFillColor=function(bgcolor)
	{
		this.bgcolor=bgcolor;
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取多面形的顯示不透明度
	*/
	PG.PolygonEntity.prototype.GetOpacity=function()
	{
		return this.opacity;
	};

	/**
		設置多面形的顯示不透明度
	*/
	PG.PolygonEntity.prototype.SetOpacity=function(opacity)
	{
		this.opacity=opacity;
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取多邊形的邊框線寬
	*/
	PG.PolygonEntity.prototype.GetLineStroke=function()
	{
		return this.weight;
	};

	/**
		設置多邊形的邊框線寬
	*/
	PG.PolygonEntity.prototype.SetLineStroke=function(weight)
	{
		this.weight=weight;
		if(this.map)
		{
			this.reDraw(true);
		}
	};

	/**
		獲取多邊形的邊框線型
	*/
	PG.PolygonEntity.prototype.GetLineStyle=function(style)
	{
		return this.lineStyle;
	};

	/**
		設置多邊形的邊框線型

		線型類型有:
		Solid(實線,默認值),ShortDash(虛線),ShortDot(點線),ShortDashDot(點劃線)
		ShortDashDotDot,Dot,Dash,LongDash,DashDot,LongDashDot,LongDashDotDot.

		此方法只在IE瀏覽器中有效.(其他瀏覽器下虛線樣式只有一種,除過solid外,其餘值均可產生虛線效果.)
	*/
	PG.PolygonEntity.prototype.SetLineStyle=function(style)
	{
		this.lineStyle=style;		
	};

	/**
		返回線兩端的形狀
	*/
	PG.PolygonEntity.prototype.GetLineArrow=function()
	{
		return this.lineArrow;
	};

	/**
		設置返回線兩端的形狀
	*/
	PG.PolygonEntity.prototype.SetLineArrow=function(start,end)
	{
		
	};

	/**
		啟動編輯
	*/
	PG.PolygonEntity.prototype.EnableEdit = function(){		
		this._eEdit = true;
		PG.Tool.setZIndex(this.div,520);
		this.dragPoints=[];
		this.listeners=[];
		if(!this.added){
			this.onInitL = PG.Event.bind(this,"init",this,function(){
				this.startEdit();
				PG.Event.removeListener(this.onInitL);
				this.onInitL = null;
			});
		}else{
			this.startEdit(true);
		}

		//回調函數
		if(this.onChangeCallback){
			this.listeners.push(PG.Event.addListener(this,"OnEdit",this.onChangeCallback));
		}
		if(this.onEditEndCallback){
			this.listeners.push(PG.Event.addListener(this,"OnEditEnd",this.onEditEndCallback));
		}
	};

	/**
		禁止編輯
	*/
	PG.PolygonEntity.prototype.DisableEdit = function(){		
		this._eEdit = false;	
		PG.Tool.setZIndex(this.div,500);
		if(this.onInitL){
			PG.Event.removeListener(this.onInitL);
			this.onInitL = null;
		}
		this.onChangeCallback=null;
		this.onEditEndCallback=null;
		this.endEdit();
	};

	/**
		是否可編輯 
	*/
	PG.PolygonEntity.prototype.IsEditable = function(){
		return !!this._eEdit;
	};

	/**
		結束編輯
	*/
	PG.PolygonEntity.prototype.endEdit = function(){
		PG.Event.trigger(this,'OnEditEnd',[]);//徐金評添加2012-6-20
		for(var i=0;i<this.listeners.length;i++){
			PG.Event.removeListener(this.listeners[i]);
		}
		this.listeners = [];
		for(var i=0;i<this.dragPoints.length;i++){
			this.map.RemoveEntity(this.dragPoints[i]);
		}
		this.dragPoints=[];		
	};

	/**
		編輯 ---- 改變線面時觸發的回調方法
	*/
	PG.PolygonEntity.prototype.OnChange = function(callback){
		if(callback){
			this.onChangeCallback = callback;
			if(this._eEdit){
				this.listeners.push(PG.Event.addListener(this,"OnEdit",this.onChangeCallback));
			}
		}
	};

	/**
		結束編輯線面時觸發的回調方法
	*/
	PG.PolygonEntity.prototype.OnEditEnd = function(callback){
		if(callback){
			this.onEditEndCallback = callback;
			if(this._eEdit){
				this.listeners.push(PG.Event.addListener(this,"OnEditEnd",this.onEditEndCallback));
			}
		}
	};
	
	/**
		開始編輯 

		isCreate	:boolean 是否創建 

	*/
	PG.PolygonEntity.prototype.startEdit = function(isCreate){		
		var borderC=this.GetLineColor();
		for(var i=0;i<this.points.length;i++){
			var p1=this.points[i];
			var p2=this.points[i==(this.points.length-1)?0:i+1];
			var p3=new PG.Point((p1.x+p2.x)/2,(p1.y+p2.y)/2,false);
			var id=i*2; 
			if(isCreate){
				this.dragPoints.push(PG.PolygonEntity.getMarkObj(this,p1,false,borderC));
				this.dragPoints[this.dragPoints.length-1].id=id;				
				this.dragPoints.push(PG.PolygonEntity.getMarkObj(this,p3,true,borderC));	
				this.dragPoints[this.dragPoints.length-1].id=id+1;	
				
			}else{
				this.dragPoints[id].SetPoint(p1);
				this.dragPoints[id+1].SetPoint(p3);
			}		
		}
		if(this.type==window.PG.ENTITY_POLYLINE){
			this.map.RemoveEntity(this.dragPoints[this.dragPoints.length-1],true);
			this.dragPoints=this.dragPoints.slice(0,-1);
		}
		//this.listeners.push(PG.Event.bind(this.div,"touchend",this,this.onMouseUp));
	};

	/**
		得到編輯點對像
	*/
	PG.PolygonEntity.getMarkObj=function(t,p,isCP,borderC){
		var m=PG.PolygonEntity.getIconObj(p,t.dragMarkerSize,[8,8],borderC,"#ffffff",1);				
		t.map.AddEntity(m);		
		m.zIndexs[1]=530;
		PG.Tool.setZIndex(m.div,530);
		m.isCP=isCP;
		m.enableDrag();
		t.listeners.push(PG.Event.addListener(m,"OnDrag",t.onDragDivMd(t,t.type==window.PG.ENTITY_POLYLINE)));
		t.listeners.push(PG.Event.addListener(m,"OnDragEnd",t.onDragDivMu(t,t.type==window.PG.ENTITY_POLYLINE)));
		return m;
	};

	/**
		得到編輯點對像
	*/
	PG.PolygonEntity.getIconObj=function(point,size,offsets,borderColor,bgColor,alpha){
		var divIcon=document.createElement("div");
		PG.Tool.setCssText(divIcon,"border:1px solid "+borderColor+";background:"+bgColor+";line-height:0px;font-size:0px;width:100%;height:100%");
		divIcon.style.opacity=alpha;
		var postMarker=new PG.MarkEntity(point,new PG.DivIcon(divIcon,size,new PG.Point(offsets[0],offsets[1])));
		return postMarker;
	};

	/**
		设置编辑点的大小編輯點對像
	*/
	PG.PolygonEntity.prototype.SetNodeSize=function(size){
		if(size){
			this.dragMarkerSize=new PG.Size(size.width,size.height);
			if(!this.dragPoints){return;};
			for(var i=0;i<this.dragPoints.length;i++){
				this.dragPoints[i].GetIcon().SetSize(size);
			}
		}	

	};
	
	/**
		拖動編輯點执行

	*/
	PG.PolygonEntity.prototype.onDragDivMd=function(polygon,isLine){
		return function(lnglat){
			var id=this.id;	
			//中点
			if(this.isCP){
				var p1=polygon.dragPoints[id-1].point;
				var p2=polygon.dragPoints[(id==polygon.dragPoints.length-1)?0:id+1].point;
				var ps=[p1,lnglat,p2];
				if(!polygon.dpcanvas){
					if(isLine){
						polygon.dpcanvas = new PG.PolylineEntity(ps,polygon.color,polygon.weight,polygon.opacity);

					}else{
						polygon.dpcanvas = new PG.PolygonEntity(ps,polygon.color,polygon.bgcolor,polygon.weight,polygon.opacity);
					}
					polygon.map.AddEntity(polygon.dpcanvas);
				}else{
					polygon.dpcanvas.setPoints(ps);
				}						
				
			}else{	
				//重新计算范围
				polygon.countBounds();
				polygon.points[parseInt(id/2)]=lnglat;
				polygon.reDraw(true);

				//更新两边编辑点的位置
				if(isLine){
					if(id==0){
						var nxt=id+2;
						var p2=lnglat;
						var p3=polygon.dragPoints[nxt].point;
						polygon.dragPoints[id+1].setPoint(new PG.Point((p3.x+p2.x)/2,(p3.y+p2.y)/2,false));

					}else if(id==polygon.dragPoints.length-1){
						var pre=id-2;
						var p1=polygon.dragPoints[pre].point;
						var p2=lnglat;
						polygon.dragPoints[pre+1].setPoint(new PG.Point((p1.x+p2.x)/2,(p1.y+p2.y)/2,false));

					}else{
						var pre=id-2;
						var nxt=id+2;
						var p1=polygon.dragPoints[pre].point;
						var p2=lnglat;
						var p3=polygon.dragPoints[nxt].point;
						polygon.dragPoints[pre+1].setPoint(new PG.Point((p1.x+p2.x)/2,(p1.y+p2.y)/2,false));
						polygon.dragPoints[id+1].setPoint(new PG.Point((p3.x+p2.x)/2,(p3.y+p2.y)/2,false));
					
					}

				}else{
					var pre=id==0?polygon.dragPoints.length-2:id-2;
					var nxt=id==polygon.dragPoints.length-2?0:id+2;
					
					var p1=polygon.dragPoints[pre].point;
					var p2=lnglat;
					var p3=polygon.dragPoints[nxt].point;

					polygon.dragPoints[pre+1].setPoint(new PG.Point((p1.x+p2.x)/2,(p1.y+p2.y)/2,false));
					polygon.dragPoints[id+1].setPoint(new PG.Point((p3.x+p2.x)/2,(p3.y+p2.y)/2,false));
				}
				
		
			}	
		};
	};

	/**
		放开編輯點执行

		
	*/
	PG.PolygonEntity.prototype.onDragDivMu=function(polygon,isLine){
		return function(lnglat){
			//是否为中点
			if(this.isCP){
				//新的编辑点数组
				polygon.map.RemoveEntity(polygon.dpcanvas,true);
				polygon.dpcanvas=null;
				var pd=[];
				var id=this.id;
				var borderC=polygon.GetLineColor();
				//被拖动点的前一个点
				var p1=polygon.dragPoints[id-1].point;
				var p2=lnglat;

				//是否为最后一个点
				if(this.id==polygon.dragPoints.length-1){
					polygon.points.push(p2);
														
					var pd=polygon.dragPoints.slice(0,-1);					
					
					var p3=new PG.Point((p1.x+p2.x)/2,(p1.y+p2.y)/2,false);
					pd.push(PG.PolygonEntity.getMarkObj(polygon,p3,true,borderC));
					pd[pd.length-1].id=id;
																	
					pd.push(this);

					var p4=polygon.dragPoints[0].point;
					
					var p5=new PG.Point((p4.x+p2.x)/2,(p4.y+p2.y)/2,false);
					pd.push(PG.PolygonEntity.getMarkObj(polygon,p5,true,borderC));
					pd[pd.length-1].id=id+2;			
						
				}else{										
					var ps=[];
					var drp=null;
					for(var i=0;i<id;i++){
						drp=polygon.dragPoints[i];
						pd.push(drp);
						if(!drp.isCP){
							ps.push(drp.point);							
						}							
					}

					ps.push(p2);				

					var p3=new PG.Point((p1.x+p2.x)/2,(p1.y+p2.y)/2,false);
					pd.push(PG.PolygonEntity.getMarkObj(polygon,p3,true,borderC));
											
					pd.push(this);
		
					var p4=polygon.dragPoints[id+1].point;
					var p5=new PG.Point((p4.x+p2.x)/2,(p4.y+p2.y)/2,false);
					pd.push(PG.PolygonEntity.getMarkObj(polygon,p5,true,borderC));
																
					for(var i=id+1;i<polygon.dragPoints.length;i++){
						drp=polygon.dragPoints[i];
						pd.push(drp);
						if(!drp.isCP){
							ps.push(drp.point);		
						}
					}
					
					//重置编辑点的id
					for(var i=0;i<pd.length;i++){
						pd[i].id=i;						
					}
					
					polygon.points=ps;				
				}	
				//更新拖动点的isCP
				this.isCP=false;
				polygon.dragPoints=pd;
				//重新计算范围
				polygon.countBounds();
				polygon.reDraw(true);	
			}
			polygon._end_p=polygon.map.WorldToWindow(lnglat);
			PG.Event.trigger(polygon,'OnEdit',[polygon._end_p]);
		}
	};

	/**
		编辑功能--整体拖动
	*/
	PG.PolygonEntity.prototype.onMouseDown = function(e){		
		if(this._eEdit){PG.Event.cancelBubble(e);}
		if(!this.map){return;}
		var p=PG.Tool.getEventPosition(e,this.map.container);	
		this._end_p = new PG.Point(p[0],p[1]);		
		PG.Event.trigger(this,"OnClick",[this._end_p]);		
	};

	/**
		線對像
	*/
	function PolylineEntity(points,color,weight,opacity)
	{
		var p = new PG.PolygonEntity(points,color,"",weight,opacity);
		p.type = window.PG.ENTITY_POLYLINE;
		return p;
	}

	window.PG.PolygonEntity=PG.PolygonEntity;
	window.PG.PolylineEntity=PolylineEntity;
}
MapNSPolygonEntity();