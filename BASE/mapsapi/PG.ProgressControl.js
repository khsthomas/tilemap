/**
	本文件是JS API之中的PG.ProgressControl類,用來在地圖上顯示一個進度條

*/
function NSProgressControl(){
		
	function ProgressControl()
	{
		PG.Tool.inherit(this,PG.Control);
		this.size=[50,50];
		var div=PG.Tool.createDiv(1);
		PG.Tool.SetSize(div,this.size);
		this.div=div;
		this.rollingimg = document.createElement("img");
		this.div.appendChild(this.rollingimg);
		this.rollingimg.src=window.PG._IMG_PATH+"maploading.gif";
	}
	PG.ProgressControl = ProgressControl;

	/**
		初始化控件		
	*/
	PG.ProgressControl.prototype.initialize=function(map)
	{
		if(!this.div || this.map){return false;}
		this.map=map;
		this.mrl=PG.Event.bind(map,"resize",this,this.setCenter);
		this.mil=PG.Event.bind(map,"OnInit",this,this.setProgress);
		this.micl=PG.Event.bind(map,"imagechange",this,this.setProgress);
		this.setCenter();
	};

	/**
		設置加載過程	
	*/
	PG.ProgressControl.prototype.setProgress=function()
	{
		//在地圖沒加載以前this.map.getTotalImgNumber()是等於0的
		var totalImgNum = this.map.getTotalImgNumber()==0?Number.MAX_VALUE:this.map.getTotalImgNumber();
		var p=this.map.getImgNumber()/totalImgNum;
		if(p>1){p=1;}
		if(p<0){p=0;}
		this.SetOpacity(1-p);
		if(p>0.8 && this.div.style.display!='none'){this.div.style.display='none';}
		if(p<0.5 && this.div.style.display=='none'){this.div.style.display='';}
	};

	/**
		設置加載條為中心位置		
	*/
	PG.ProgressControl.prototype.setCenter=function()
	{
		var mapSize=this.map.GetWindow();
		this.SetLeft(mapSize[0]/2-this.size[0]/2);
		this.SetTop(mapSize[1]*3/5-this.size[1]/2);
	};

	/**
		返回容器
	*/
	PG.ProgressControl.prototype.getObject=function()
	{
		return this.div;
	};

	/**
		
	*/
	PG.ProgressControl.prototype.remove=function()
	{
		PG.Event.removeListener(this.mrl);
		this.mrl=null;
		PG.Event.removeListener(this.mil);
		this.mil=null;
		PG.Event.removeListener(this.micl);
		this.micl=null;
	};

	/**
		銷毀進度條控件		
	*/
	PG.ProgressControl.prototype.depose=function()
	{
		PG.Event.deposeNode(this.div);
		this.div=null;
	};

	window.PG.ProgressControl=PG.ProgressControl;

}
NSProgressControl();