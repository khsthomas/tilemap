/**
	本文件是JS API之中的PG.Polyline對像,用來代表一個點的坐標
	
*/
function NSPolyline()
{
	/**
		聚合線幾何類型		
	*/
	function Polyline(points)
	{
		PG.Tool.inherit(this,PG.Geo);
		PG.Tool.inherit(this,PG.Polyline.prototype);
		this.type = window.PG.GEO_POLYLINE;
		this.points = points;
	}

	PG.Polyline = Polyline;

	/**
		取聚合線的點
	*/
	PG.Polyline.prototype.GetPoints = function(){
		return this.points;
	};

	/**
		設聚合線的點
	*/
	PG.Polyline.prototype.SetPoints = function(points){
		this.points = points;
	};

	/**
		求聚合線總長---單位為米
	*/
	PG.Polyline.prototype.GetLength = function(){
		return PG.PolyLineTool.GetPointsDistance(this.points);
	};

	/**
		傳回該幾何對象的矩形範圍
		說明：
		1，	找出MinX, MaxX, MinY, MaxY, 然後據此傳回一個PG.Rect。
		2，	PolygonSet就是取Bounds的部分計算即可。
		3，	PG.Point的MinX和MaxX，MinY和 MaxY相同。

	*/
	PG.Polyline.prototype.GetBoundary = function(){
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
	PG.Polyline.prototype.Clone = function(){
		var ps=[];
		for(var k=0;k<this.points.length;k++){
			ps.push(this.points[k].Clone());
		}
		return new PG.Polyline(ps);
	};

	/**
		從Other複製來。例如：B.CopyFrom(A)，就是由A複製給B，而A跟B是同型態的物件。
	*/
	PG.Polyline.prototype.CopyFrom = function(other){	
		if(!other){return;}
		this.points = [];
		for(var k=0;k<other.points.length;k++){
			this.points.push(other.points[k].Clone());
		}	
	};

	/**
		是否相等
	*/
	PG.Polyline.prototype.Equal = function(other){
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

	window.PG.Polyline = PG.Polyline;
}
NSPolyline();