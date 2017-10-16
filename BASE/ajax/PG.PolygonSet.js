/**
	本文件是JS API之中的PG.Polygon對像,用來代表一個點的坐標
	
*/
function NSPolygonSet()
{
	/**
		多邊形幾何類型		
	*/
	function PolygonSet(bounds,holes)
	{
		PG.Tool.inherit(this,PG.Geo);
		PG.Tool.inherit(this,PG.PolygonSet.prototype);
		this.type = window.PG.GEO_POLYGONSET;

		this.bounds = bounds;	//加入有效範圍內的PG_Polygond的數組
		this.holes = holes;		//加入排除範圍內的PG_Polygond的數組
	}

	PG.PolygonSet = PolygonSet;

	/**
		設定多邊形為複雜多邊形集的有效範圍內
	*/
	PG.PolygonSet.prototype.SetBounds = function(polygon){
		if(polygon){this.bounds = polygon;}
	};

	/**
		設定多邊形為複雜多邊形集的排除範圍內
	*/
	PG.PolygonSet.prototype.SetHoles = function(polygon){
		if(polygon){this.holes = polygon;}		
	};

	/**
		取得有效範圍內的複雜多邊形集
	*/
	PG.PolygonSet.prototype.GetBounds = function(polygon){
		return this.bounds;
	};

	/**
		取得排除範圍內的複雜多邊形集
	*/
	PG.PolygonSet.prototype.GetHoles = function(polygon){
		return this.holes;	
	};

	/**
		求有效範圍複雜多邊形集面積
	*/
	PG.PolygonSet.prototype.GetBoundsArea = function(){		
		return this.CalPArea(this.bounds);
	};

	/**
		求排除範圍複雜多邊形集面積
	*/
	PG.PolygonSet.prototype.GetHolesArea = function(){
		return this.CalPArea(this.holes);
	};
	
	/**
		求多邊形集面積
	*/
	PG.PolygonSet.prototype.CalPArea = function(PolygonSet){
		var c = 0;
		for(var k=0;k<PolygonSet.length;k++){c+=PolygonSet[k].GetArea();}
		return c;
	};

	/**
		傳回該幾何對象的矩形範圍
		說明：
		1，	找出MinX, MaxX, MinY, MaxY, 然後據此傳回一個PG.Rect。
		2，	PolygonSet就是取Bounds的部分計算即可。
		3，	PG.Point的MinX和MaxX，MinY和 MaxY相同。

	*/
	PG.PolygonSet.prototype.GetBoundary = function(){
		var b = window.PG.LEGALLNGLATBOUNDS;
		var MinX = b[0];
		var MaxX = b[1];
		var MinY = b[2];
		var MaxY = b[3];
		for(var i=0;i<this.bounds.length;i++){
			var ps = this.bounds[i].points;
			for(var k=0;k<ps.length;k++){
				MinX = Math.min(MinX,ps[k].x);
				MaxX = Math.max(MaxX,ps[k].x);
				MinY = Math.min(MinY,ps[k].y);
				MaxY = Math.max(MaxY,ps[k].y);
			}
		}
		return new PG.Rect(MinX,MaxY,MaxX,MinY,this.bounds[0].points[0].nowrap);
	};

	/**
		傳回本身對象的複製。例如：A=B.Clone()，就是由B複製給A。
	*/
	PG.PolygonSet.prototype.Clone = function(){
		var bounds = [];
		for(var k=0;k<this.bounds.length;k++){bounds.push(this.bounds[k].Clone());}
		var holes = [];
		for(var k=0;k<this.holes.length;k++){holes.push(this.holes[k].Clone());}
		return new PG.PolygonSet(bounds,holes);
	};

	/**
		從Other複製來。例如：B.CopyFrom(A)，就是由A複製給B，而A跟B是同型態的物件。
	*/
	PG.PolygonSet.prototype.CopyFrom = function(other){		
		if(!other){return;}
		this.bounds = [];
		for(var k=0;k<other.bounds.length;k++){this.bounds.push(other.bounds[k].Clone());}
		this.holes = [];
		for(var k=0;k<other.holes.length;k++){this.holes.push(other.holes[k].Clone());}
	};

	/**
		是否相等
	*/
	PG.PolygonSet.prototype.Equal = function(other){
		if(this==other){return true;}
		if(this.type!=other.type){return false;}
		if(this.EqualJudge(this.bounds,other.bounds)){
			return this.EqualJudge(this.holes,other.holes);
		}
		return false;
	};

	/**
		判斷兩個面數組是否相等
	*/
	PG.PolygonSet.prototype.EqualJudge = function(b1,b2){
		if(b1&&b2){
			if(b1==b2){return true;}
			if(b1.length==b2.length){
				for(var i=0;i<b1.length;i++){
					var c=0;
					for(var k=0;k<b2.length;k++,c++){
						if(b1[i].Equal(b2[k])){continue;}
						if(c==(b2.length-1)){return false;}
					}
				}
				return true;
			}
		}
		return false;
	};

	window.PG.PolygonSet = PG.PolygonSet;
}
NSPolygonSet();