/**
	本文件是JS API之中的PG.Rect對像,用來代表一個矩形的坐標範圍
	並提供一些相關的方法,比如矩形之間的交叉判斷,點和矩形的位置判斷等
*/
function NSRect()
{		
	
	/**
		坐標範圍
	*/
	function Rect(left,top,right,bottom,nowrap)
	{
		PG.Tool.inherit(this,PG.Geo);
		PG.Tool.inherit(this,PG.Rect.prototype);
		this.type = window.PG.GEO_RECT;
		this.nowrap = true;
		this.legalLngLatBounds = window.PG.LEGALLNGLATBOUNDS;

		this.left = left;			//左邊界
		this.top = top;				//上邊界
		this.right = right;			//右邊界
		this.bottom = bottom;		//下邊界

		if(nowrap===false){
			this.nowrap = false;		

			if(parseInt(this.left).toString().length<=4){this.left = this.left*100000;}
			if(parseInt(this.top).toString().length<=4){this.top = this.top*100000;}
			if(parseInt(this.right).toString().length<=4){this.right = this.right*100000;}
			if(parseInt(this.bottom).toString().length<=4){this.bottom = this.bottom*100000;}

			if(!this.ISLegalLngLatBounds(this.left,this.bottom)){
				throw 'Sorry,the left or bottom is illegal.';
			}

			if(!this.ISLegalLngLatBounds(this.right,this.top)){
				throw 'Sorry,the right or top is illegal.';
			}

			this.XminNTU=this.left;
			this.YminNTU=this.bottom;
			this.XmaxNTU=this.right;
			this.YmaxNTU=this.top;

			var lnglatMax=PG.Tool.forwardMercator(this.XmaxNTU/100000,this.YmaxNTU/100000);
			var lnglatMin=PG.Tool.forwardMercator(this.XminNTU/100000,this.YminNTU/100000);

			this.XminMercator=lnglatMin[0];
			this.YminMercator=lnglatMin[1];
			this.XmaxMercator=lnglatMax[0];
			this.YmaxMercator=lnglatMax[1];

		}		
	}

	PG.Rect = Rect;

	/**
		
	*/
	PG.Rect.prototype.GetLTRB = function()
	{
		return [this.GetLeft(),this.GetTop(),this.GetRight(),this.GetBottom()];
	};
	
	/**
		
	*/
	PG.Rect.prototype.SetLTRB = function(r)
	{
		if(r){
			this.SetLeft(r[0]);
			this.SetTop(r[1]);
			this.SetRight(r[2]);
			this.SetBottom(r[3]);
		}
	};

	/**
		得到點數組確定的範圍
	*/
	PG.Rect.GetPointsBounds=function(points)
	{
		var b = window.PG.LEGALLNGLATBOUNDS;
		var bounds=new PG.Rect(b[0],b[3],b[1],b[2]);
		var len = points.length; 
		if(len>0){
			bounds.nowrap = points[0].nowrap;
			bounds.SetLeft(points[0].x);
			bounds.SetRight(points[0].x);
			bounds.SetBottom(points[0].y);
			bounds.SetTop(points[0].y);
		}
		for(var i=len-1;i>=1;i--)
		{
			bounds.Extend(points[i]);
		}
		return bounds;
	};

	/**
		把矩形和點結合擴展.
	*/
	PG.Rect.prototype.Extend=function(point)
	{
		var lng=point.x,lat=point.y;
		if(this.left>lng){this.SetLeft(lng);}else if(this.right<lng){this.SetRight(lng);}
		if(this.bottom>lat){this.SetBottom(lat);}else if(this.top<lat){this.SetTop(lat);}
	};

	/**
		判斷該範圍是否包含指定範圍
	*/
	PG.Rect.prototype.IsInclude=function(bounds)
	{
		return (bounds.left>this.left && bounds.right<this.right && bounds.bottom>this.bottom && bounds.top<this.top);
	};
	
	/**
		判斷該範圍是否包含指定點
	*/
	PG.Rect.prototype.ContainsPoint=function(point)
	{
		return (point.x>=this.left && point.x<this.right && point.y>=this.bottom && point.y<this.top);
	};		

	/**
		得到交叉的矩形經緯度範圍

		求與Other的交集
	*/
	PG.Rect.prototype.GetIntersectRect = function(other){
		if(!this.IsIntersection(other)){return null;}
		var xmin = Math.min(this.GetLeft(),other.GetLeft());
		var xmax = Math.max(this.GetRight(),other.GetRight());
		var ymin = Math.min(this.GetBottom(),other.GetBottom());
		var ymax = Math.max(this.GetTop(),other.GetTop());	
		return new PG.Rect(xmin,ymax,xmax,ymin,this.nowrap);
	};

	/**
		是否與Other相交
	*/
	PG.Rect.prototype.IsIntersection = function(other){
		if(!other){return false;}
		var f=this.right<other.left||this.left>other.right||this.top<other.bottom||this.top<other.bottom;
		if(f){return false;}else{return true;}
	};

	/**
		計算該範圍的邊框和指定線段的交點
	*/
	PG.Rect.prototype.GetIntersection=function(startPoint,endPoint)
	{ 
		/*
			var left=this.nowrap?this.left:this.XminMercator;
			var top=this.nowrap?this.top:this.YmaxMercator;
			var right=this.nowrap?this.right:this.XmaxMercator;
			var bottom=this.nowrap?this.bottom:this.YminMercator;
			var sx = startPoint.nowrap?startPoint.x:startPoint.MercatorLng;
			var sy = startPoint.nowrap?startPoint.y:startPoint.MercatorLat;
			var ex = endPoint.nowrap?endPoint.x:endPoint.MercatorLng;
			var ey = endPoint.nowrap?endPoint.y:endPoint.MercatorLat;
		*/
		var left=this.XminMercator;
		var top=this.YmaxMercator;
		var right=this.XmaxMercator;
		var bottom=this.YminMercator;
		var sx = startPoint.MercatorLng;
		var sy = startPoint.MercatorLat;
		var ex = endPoint.MercatorLng;
		var ey = endPoint.MercatorLat;
		
		var intersection=[];
		if(sy==ey)
		{
			if(sx==ex){return intersection;}
			if(sy>=bottom && sy<top)
			{
				var start=sx<=left?-1:(sx>=right?1:0);
				var end=ex<=left?-1:(ex>=right?1:0);
				if(start==end){return intersection;}
				if(start+end<=0){intersection.push(new PG.Point(this.left,startPoint.y,false));}
				if(start+end>=0){intersection.push(new PG.Point(this.right,startPoint.y,false));}
			}
			return intersection;
		}
		else if(sx==ex)
		{
			if(sx>=left && sx<right)
			{
				var start=sy<=bottom?-1:(sy>=top?1:0);
				var end=ey<=bottom?-1:(ey>=top?1:0);
				if(start==end){return intersection;}
				if(start+end<=0){intersection.push(new PG.Point(startPoint.x,this.bottom,false));}
				if(start+end>=0){intersection.push(new PG.Point(startPoint.x,this.top,false));}
			}
			return intersection;
		}
		var leftY=(ey-sy)*(left-sx)/(ex-sx)+sy;
		if(leftY>=bottom && leftY<top && (leftY-sy)*(leftY-ey)<=0)
		{
			var _p_m=PG.Tool.inverseMercator(left,leftY);
			intersection.push(new PG.Point(_p_m[0]*100000,_p_m[1]*100000,false));
		}
		var rightY=(ey-sy)*(right-sx)/(ex-sx)+sy;
		if(rightY>=bottom && rightY<top && (rightY-sy)*(rightY-ey)<=0)
		{
			var _p_m=PG.Tool.inverseMercator(right,rightY);
			intersection.push(new PG.Point(_p_m[0]*100000,_p_m[1]*100000,false));
		}
		var topX=(ex-sx)*(top-sy)/(ey-sy)+sx;
		if(topX>=left && topX<right && (topX-sx)*(topX-ex)<=0)
		{
			var _p_m=PG.Tool.inverseMercator(topX,top);
			intersection.push(new PG.Point(_p_m[0]*100000,_p_m[1]*100000,false));
		}
		var bottomX=(ex-sx)*(bottom-sy)/(ey-sy)+sx;
		if(bottomX>=left && bottomX<right && (bottomX-sx)*(bottomX-ex)<=0)
		{
			var _p_m=PG.Tool.inverseMercator(bottomX,bottom);
			intersection.push(new PG.Point(_p_m[0]*100000,_p_m[1]*100000,false));
		}
		if(intersection.length==2)
		{
			if(intersection[0].MercatorLng==intersection[1].MercatorLng)
			{//如果兩個交點實際上相同,則只返回一個
				intersection.pop();
			}
		}
		return intersection;
	};

	/**
		將傳入的PG.Rect與本PG.Rect聯集後，取出聯集的範圍做為本物件的值。
		參數： Other矩形

	*/
	PG.Rect.prototype.Union = function(Other){
		if(!Other){return;}
		if(Other.type!=this.type||Other.nowrap!=this.nowrap){return;}
		if(this.left>Other.left){this.SetLeft(Other.left);}
		if(this.right<Other.right){this.SetRight(Other.right);}
		if(this.bottom>Other.bottom){this.SetBottom(Other.bottom);}
		if(this.top<Other.top){this.SetTop(Other.top);}			
	};
	

	/**
		判斷矩形範圍是否為空
	*/
	PG.Rect.prototype.IsEmpty = function(){
		return this.GetTop()<=this.GetBottom()||this.GetRight()<=this.GetLeft();
	};

	/**
		得到中心經緯點
	*/
	PG.Rect.prototype.GetCenter = function(){
		return new PG.Point((this.GetRight() + this.GetLeft())/2,(this.GetTop() + this.GetBottom())/2,this.nowrap);
	};

	/**
		傳回該幾何對象的矩形範圍
		說明：
		1，	找出MinX, MaxX, MinY, MaxY, 然後據此傳回一個PG.Rect。
		2，	PolygonSet就是取Bounds的部分計算即可。
		3，	PG.Point的MinX和MaxX，MinY和 MaxY相同。

	*/
	PG.Rect.prototype.GetBoundary = function(){
		return new PG.Rect(this.left,this.top,this.right,this.bottom,this.nowrap);
	};

	/**
		傳回本身對象的複製。例如：A=B.Clone()，就是由B複製給A。
	*/
	PG.Rect.prototype.Clone = function(){
		return new PG.Rect(this.left,this.top,this.right,this.bottom,this.nowrap);
	};

	/**
		從Other複製來。例如：B.CopyFrom(A)，就是由A複製給B，而A跟B是同型態的物件。
	*/
	PG.Rect.prototype.CopyFrom = function(other){	
		if(!other){return;}
		this.nowrap = true;
		if(other.nowrap===false){this.nowrap = false;}
		this.SetRight(other.right);
		this.SetLeft(other.left);
		this.SetTop(other.top);
		this.SetBottom(other.bottom);
	};

	/**
		判斷該點是否和p相等
	*/
	PG.Rect.prototype.Equal = function(p){
		if(this==p){return true;}
		if(this.type!=p.type){return false;}		
		return (parseFloat(this.right)===parseFloat(p.right))&&(parseFloat(this.left)===parseFloat(p.left))&&(parseFloat(this.top)===parseFloat(p.top))&&(parseFloat(this.bottom)===parseFloat(p.bottom));
	};

	/**
		設置最大經度坐標
	*/
	PG.Rect.prototype.SetRight = function(Xmax)
	{
		this.right=Xmax;
		if(this.nowrap===false){
			if(parseInt(this.right).toString().length<=4){this.right = this.right*100000;}
			this.XmaxNTU=this.right;		
			var lnglat=PG.Tool.forwardMercator(this.XmaxNTU/100000,this.YmaxNTU/100000);
			this.XmaxMercator=lnglat[0];
		}		
	};

	/**
		設置最大緯度坐標
	*/
	PG.Rect.prototype.SetTop = function(Ymax)
	{
		this.top=Ymax;
		if(this.nowrap===false){
			if(parseInt(this.top).toString().length<=4){this.top = this.top*100000;}
			this.YmaxNTU=this.top;		
			var lnglat=PG.Tool.forwardMercator(this.XmaxNTU/100000,this.YmaxNTU/100000);
			this.YmaxMercator=lnglat[1];
		}		
	};

	/**
		設置最小經度坐標
	*/
	PG.Rect.prototype.SetLeft = function(Xmin)
	{
		this.left=Xmin;
		if(this.nowrap===false){
			if(parseInt(this.left).toString().length<=4){this.left = this.left*100000;}
			this.XminNTU=this.left;		
			var lnglat=PG.Tool.forwardMercator(this.XminNTU/100000,this.YminNTU/100000);
			this.XminMercator=lnglat[0];
		}		
	};

	/**
		設置最小緯度坐標
	*/
	PG.Rect.prototype.SetBottom = function(Ymin)
	{
		this.bottom=Ymin;
		if(this.nowrap===false){
			if(parseInt(this.bottom).toString().length<=4){this.bottom = this.bottom*100000;}
			this.YminNTU=this.bottom;		
			var lnglat=PG.Tool.forwardMercator(this.XminNTU/100000,this.YminNTU/100000);
			this.YminMercator=lnglat[1];
		}		
	};	

	/**
		
	*/
	PG.Rect.prototype.GetLeft = function()
	{
		return this.nowrap?this.left:this.left/100000;
	};

	/**
		
	*/
	PG.Rect.prototype.GetTop = function()
	{
		return this.nowrap?this.top:this.top/100000;
	};

	/**
		
	*/
	PG.Rect.prototype.GetRight = function()
	{
		return this.nowrap?this.right:this.right/100000;
	};

	/**
		
	*/
	PG.Rect.prototype.GetBottom = function()
	{
		return this.nowrap?this.bottom:this.bottom/100000;
	};

	/**
		x,y座標範圍在-180 degrees 和 +180 degrees , -90 degrees 和 +90 degrees
	*/
	PG.Rect.prototype.ISLegalLngLatBounds = function(x,y){
		return ((x>=this.legalLngLatBounds[0])&&(x<=this.legalLngLatBounds[1]))&&((y>=this.legalLngLatBounds[2])&&(y<=this.legalLngLatBounds[3]));
	};	

	window.PG.Rect=PG.Rect;
}
NSRect();