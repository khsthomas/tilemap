/**
	本文件是JS API之中的PG.Geo對像
*/
function NSGeo()
{
	
	
	/**
		Geo子類列表:

		1：PG.Point
		2：PG.Rect
		3：PG.Polyline
		4：PG.Polygon
		5：PG.PolygonSet

	*/
	function Geo(x,y,noWrap)
	{		
		this.type = window.PG.GEO_GEO;
	}
	PG.Geo = Geo;

	/**
		傳回該幾何對象的矩形範圍
		說明：
		1，	找出MinX, MaxX, MinY, MaxY, 然後據此傳回一個PG.Rect。
		2，	PolygonSet就是取Bounds的部分計算即可。
		3，	PG.Point的MinX和MaxX，MinY和 MaxY相同。

	*/
	PG.Geo.prototype.GetBoundary = function(){
		
	};

	/**
		傳回本身對象的複製。例如：A=B.Clone()，就是由B複製給A。
	*/
	PG.Geo.prototype.Clone = function(){
		
	};

	/**
		從Other複製來。例如：B.CopyFrom(A)，就是由A複製給B，而A跟B是同型態的物件。
	*/
	PG.Geo.prototype.CopyFrom = function(other){		

	};

	/**
		是否相等
	*/
	PG.Geo.prototype.Equal = function(other){
		
	};

	window.PG.Geo=PG.Geo;
}
NSGeo();