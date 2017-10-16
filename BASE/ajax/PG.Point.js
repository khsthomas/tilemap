/**
	本文件是JS API之中的PG.Point對像,用來代表一個點的坐標
	
*/
function NSPoint()
{
	function Point(x,y,nowrap)
	{		
		PG.Tool.inherit(this,PG.Geo);
		PG.Tool.inherit(this,PG.Point.prototype);
		this.legalLngLatBounds = window.PG.LEGALLNGLATBOUNDS;

		//和數組模式兼容
		this[0] = parseFloat(x);
		this[1] = parseFloat(y);
		this.type = window.PG.GEO_POINT;
		this.nowrap = true;
		//nowrap===false代表經緯度
		if(nowrap===false){
			this.nowrap = false;
			
			//兼容小數點的經緯度
			if(parseInt(this[0]).toString().length<=5){
				this[0] = this[0]*100000;
			}
			if(parseInt(this[1]).toString().length<=5){
				this[1] = this[1]*100000;
			}

			if(!this.ISLegalLngLatBounds(this[0],this[1])){
				//alert(this[0]+'  '+this[1]+'  '+x+'  '+y);
				throw 'Sorry,the x or y is illegal.';
			}

			var mercator = PG.Tool.forwardMercator(this[0]/100000,this[1]/100000);
			this.MercatorLng = mercator[0];
			this.MercatorLat = mercator[1];
		}
		this.x = this[0];
		this.y = this[1];
	}
	PG.Point = Point;

	/**
		求與Other平面直線距離
	*/
	PG.Point.prototype.Distance = function(other){
		return Math.parseInt(Math.sqrt(Math.pow((Math.abs(this.x/100000 - other.x/100000)),2) + Math.pow((Math.abs(this.y/100000 - other.y/100000)),2)));
	};

	/**
		求球面距離。必須nowrap為false時有效，否則傳回-1，失敗亦然
	*/
	PG.Point.prototype.SphereDistance = function(other, radius){
		if(this.nowrap){return -1;}
		return PG.Tool.getPointsDistance(this,other,radius);
	};

	/**
		返回相對於正東方向的夾角,逆時針方向,範圍為-180和+180度之間（沒測試）
	*/
	PG.Point.prototype.PolarAngle = function(other){
		return (Math.atan2(other.y-this.y,other.x-this.x)) * 180 / Math.PI;
	};

	/**
		傳回該幾何對象的矩形範圍
		說明：
		1，	找出MinX, MaxX, MinY, MaxY, 然後據此傳回一個PG.Rect。
		2，	PolygonSet就是取Bounds的部分計算即可。
		3，	PG.Point的MinX和MaxX，MinY和 MaxY相同。

	*/
	PG.Point.prototype.GetBoundary = function(){
		return new PG.Rect(this.x,this.y,this.x,this.x,this.y,this.nowrap);
	};

	/**
		傳回本身對象的複製。例如：A=B.Clone()，就是由B複製給A。
	*/
	PG.Point.prototype.Clone = function(){
		return new PG.Point(this.x,this.y,this.nowrap);
	};

	/**
		從Other複製來。例如：B.CopyFrom(A)，就是由A複製給B，而A跟B是同型態的物件。
	*/
	PG.Point.prototype.CopyFrom = function(other){	
		if(!other){return;}
		this.nowrap = true;
		if(other.nowrap===false){this.nowrap = false;}
		this.SetX(other.x);
		this.SetY(other.y);
	};

	/**
		判斷該點是否和p相等
	*/
	PG.Point.prototype.Equal = function(p){
		if(this==p){return true;}
		if(this.type!=p.type){return false;}
		return (parseFloat(this.x)===parseFloat(p.x))&&(parseFloat(this.y)===parseFloat(p.y));
	};

	/**
		設定x座標
	*/
	PG.Point.prototype.SetX = function(x){	
		this.x = x;
		this[0] = x;
		if(this.nowrap===false){
			if(parseInt(x).toString().length<=4){this[0] = x*100000;}		
			this.x=this[0];
			var mercator=PG.Tool.inverseMercator(this.x/100000,this.y/100000);
			this.MercatorLng=mercator[0];
		}			
	};

	/**
		取得x座標
	*/
	PG.Point.prototype.GetX = function(){
		return this.nowrap?this.x:this.x/100000;
	};

	/**
		設定y座標
	*/
	PG.Point.prototype.SetY = function(y){	
		this.y = y;
		this[1] = y;
		if(this.nowrap===false){
			if(parseInt(y).toString().length<=4){this[1] = this[1]*100000;}
			this.y=this[1];
			var mercator=PG.Tool.inverseMercator(this.x/100000,this.y/100000);			
			this.MercatorLat=mercator[1];
		}
	};

	/**
		取得Y座標
	*/
	PG.Point.prototype.GetY = function(){
		return this.nowrap?this.y:this.y/100000;
	};

	/**
		x,y座標範圍在-180 degrees 和 +180 degrees , -90 degrees 和 +90 degrees
	*/
	PG.Point.prototype.ISLegalLngLatBounds = function(x,y){
		return ((x>=this.legalLngLatBounds[0])&&(x<=this.legalLngLatBounds[1]))&&((y>=this.legalLngLatBounds[2])&&(y<=this.legalLngLatBounds[3]));
	};

	window.PG.Point=PG.Point;
}
NSPoint();