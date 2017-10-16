/**
	本文件是JS API之中所有控件類的基類,如果想實現自定義的控件,請繼承該類的所有方法
	每個控件應該有initialize,getObject,depose三個方法
	
*/
function MapNSControl()
{
	function Control(){}
	PG.Control = Control;

	/**
		設置控件相對於地圖左邊的像素距離	
	*/
	PG.Control.SetLeft=function(length)
	{
		this.getObject().style.left=PG.Tool.getUserInput(length);
	};

	/**
		設置控件相對於地圖右邊的像素距離	
	*/
	PG.Control.SetRight=function(length)
	{
		this.getObject().style.left="auto";
		this.getObject().style.right=PG.Tool.getUserInput(length);
	};

	/**
		設置控件相對於地圖上邊的像素距離	
	*/
	PG.Control.SetTop=function(length)
	{
		this.getObject().style.top=PG.Tool.getUserInput(length);
	};

	/**
		設置控件相對於地圖下邊的像素距離	
	*/
	PG.Control.SetBottom=function(length)
	{
		this.getObject().style.top="auto";
		this.getObject().style.bottom=PG.Tool.getUserInput(length);
	};

	/**
		設置控件透明度
	*/
	PG.Control.SetOpacity=function(opacity)
	{
		this._base_opa = opacity;
		PG.Tool.setOpacity(this.getObject(),opacity);
	};

	/**
		返回控件透明度
	*/
	PG.Control.GetOpacity=function()
	{
		return this._base_opa;
	};

	/**
		顯示控件
	*/
	PG.Control.Show=function(){
		this.getObject().style.display = "block";
	};

	/**
		隱藏控件	
	*/
	PG.Control.Hidden=function(){
		this.getObject().style.display = "none";
	};

	/**
		返回控件是否隱藏
	*/
	PG.Control.IsHidden=function(){
		return this.getObject().style.display == "none";
	};

	/**
		設置控件是否可見 	
	*/
	PG.Control.setVisible = function(booleans)
	{
		this.getObject().style.visibility =booleans?"visible":"hidden";
	};

	window.PG.Control=PG.Control;
}
MapNSControl();