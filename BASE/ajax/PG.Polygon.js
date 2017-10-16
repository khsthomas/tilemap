/**
	本文件是JS API之中的PG.Polygon對像,用來代表一個點的坐標
	
*/
function NSPolygon()
{
	/**
		多邊形幾何類型	建構子	
	*/
	function Polygon(points)
	{
		PG.Tool.inherit(this,PG.Geo);
		PG.Tool.inherit(this,PG.Polygon.prototype);//才會加上所有prototype出來的方法
		this.type = window.PG.GEO_POLYGON;
		this.points = points;
	}

	PG.Polygon = Polygon;

	/**
		取多邊形的點
	*/
	PG.Polygon.prototype.GetPoints = function(){
		return this.points;
	};

	/**
		設多邊形的點
	*/
	PG.Polygon.prototype.SetPoints = function(points){
		this.points = points;		
	};

	/**
		求多邊形面積---單位為平方米
	*/
	PG.Polygon.prototype.GetArea = function(){
		if(!this.points){return 0;}
		return PG.PolygonTool.getPointsArea(this.points);
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
	PG.Polygon.prototype.ContainsPoint = function(pt){
		if(!pt){return false;}
		if((pt.type!=window.PG.GEO_POINT)){return false;}
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
		傳回該幾何對象的矩形範圍
		說明：
		1，	找出MinX, MaxX, MinY, MaxY, 然後據此傳回一個PG.Rect。
		2，	PolygonSet就是取Bounds的部分計算即可。
		3，	PG.Point的MinX和MaxX，MinY和 MaxY相同。

	*/
	PG.Polygon.prototype.GetBoundary = function(){
		if(!this.points){return null;}
		var MinX = this.points[0].x;
		var MaxX = this.points[0].x;
		var MinY = this.points[0].y;
		var MaxY = this.points[0].y;
		for(var k=1;k<this.points.length;k++){
			MinX = Math.min(MinX,this.points[k].x);
			MaxX = Math.max(MaxX,this.points[k].x);
			MinY = Math.min(MinY,this.points[k].y);
			MaxY = Math.max(MaxY,this.points[k].y);
		}
		return new PG.Rect(MinX,MaxY,MaxX,MinY,this.points[0].nowrap);
	};

	/**
		傳回本身對象的複製。例如：A=B.Clone()，就是由B複製給A。
	*/
	PG.Polygon.prototype.Clone = function(){
		var ps=[];
		for(var k=0;k<this.points.length;k++){
			ps.push(this.points[k].Clone());
		}
		return new PG.Polygon(ps); 
	};

	/**
		從Other複製來。例如：B.CopyFrom(A)，就是由A複製給B，而A跟B是同型態的物件。
	*/
	PG.Polygon.prototype.CopyFrom = function(other){	
		if(!other){return;}
		this.points = [];
		for(var k=0;k<other.points.length;k++){
			this.points.push(other.points[k].Clone());
		}	
	};

	/**
		是否相等
	*/
	PG.Polygon.prototype.Equal = function(other){
		if(this==other){return true;}
		if(this.type!=other.type){return false;}
		if(this.points&&other.points){
			if(this.points==other.points){return true;}
			var l1 = this.points.length;
			var l2 = other.points.length;
			if((l1==l2)||((l1>0)&&(l2>0))){
				for(var i=0;i<l1.length;i++){
					var c=0;
					for(var k=0;k<l2.length;k++,c++){
						if(this.points[i].Equal(other.points[k])){continue;}
						if(c==(l2-1)){return false;}
					}
				}
				return true;
			}
		}
		return false;
	};

	window.PG.Polygon=PG.Polygon;
}
NSPolygon();