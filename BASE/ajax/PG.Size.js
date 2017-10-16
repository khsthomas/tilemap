/**
	本文件是JS API之中的PG.Size對像,用來代表PG.Marker圖片的大小
	
*/
function NSSize()
{
	function Size(w,h)
	{
		this.width = parseFloat(w);
		this.height = parseFloat(h);
	}
	PG.Size = Size;

	/**
		判斷該Size是否和s相等
	*/
	PG.Size.prototype.equals = function(s){
		return parseFloat(this.width)===parseFloat(p.width)&&parseFloat(this.height)===parseFloat(p.height);
	};

	/**
		打印PG.Size對像時的默認輸出----獲得大小
	*/
	PG.Size.prototype.toString = function(){
		return this.width + "," + this.height;
	};

	window.PG.Size=PG.Size;
}
NSSize();