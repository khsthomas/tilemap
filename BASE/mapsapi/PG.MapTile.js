/**
	本文件是JS API之中的PG.MapTile和PG.MapTileMgr對像,用來處理地圖上的分塊圖片

*/
function MapNSMapTile()
{
	/**
		地圖瓦片

		mgr為地圖瓦片管理對像MapTileMgr
		src為圖片地址
		position為圖片絕對定位的位置,也是一個數組,格式為[left,top]
		id為數組,格式為[x,y,zoom]
	*/
	function MapTile(mgr,src,position,id)
	{
		this.mgr=mgr;
		this.name=mgr.getTileName(id);
		this.id=id;
		var img=document.createElement("img");
		PG.Tool.SetSize(img,[mgr.imgSize,mgr.imgSize]);
		PG.Tool.setUnSelectable(img);
		img.style.position="absolute";
		img.galleryImg=false;
		PG.Tool.setPosition(img,position);
		this.img=img;
		this.loadListener=PG.Event.bind(img,"load",this,this.onLoad);
		this.errorListener=PG.Event.bind(img,"error",this,this.onError);
		img.src=src;	
		
		if(this.mgr.map.bInfo.isIE){
			this.img.style.msInterpolationMode = "nearest-neighbor";
		}
	}

	PG.MapTile = MapTile; 

	/**
		加載地圖瓦片
	*/
	PG.MapTile.prototype.onLoad=function()
	{
		var mgr=this.mgr;
		this.stopLoad();
		var bufferImages=mgr.bufferImages;
		bufferImages[this.name]=this;//緩存加載的地圖瓦片---徐金評
		bufferImages.push(this.name);

		//如果緩存中的圖片已經超過緩存容量,清除一部分
		var dNum=bufferImages.length-mgr.bufferNumber;
		for(var i=0;dNum>0&&i<bufferImages.length;i++)
		{
			var index=bufferImages[i];
			if(!mgr.mapImages[index])
			{
				if(bufferImages[index])
				{
					bufferImages[index].mgr=null;
					PG.Event.deposeNode(bufferImages[index].img);
					bufferImages[index].depose();
					delete bufferImages[index];
				}
				bufferImages.splice(i,1);
				i--;
				dNum--;
			}
		}
		this.loaded=true;
		mgr.imgNumber++;
		if(!PG.Tool.isInDocument(this.img))
		{//添加圖片到頁面顯示
			mgr.getParentDiv(this.id).appendChild(this.img);
		}
		PG.Event.trigger(mgr.map,"imagechange",[this,1]);
	};

	/**
		設置地圖瓦片位置
	*/
	PG.MapTile.prototype.setPosition=function(position)
	{
		PG.Tool.setPosition(this.img,position);
	};

	/**
		停止加載地圖瓦片
	*/
	PG.MapTile.prototype.stopLoad=function()
	{
		PG.Event.removeListener(this.loadListener);
		this.loadListener=null;
		PG.Event.removeListener(this.errorListener);
		this.errorListener=null;
	};

	/**
		加載地圖瓦片出錯觸發
	*/
	PG.MapTile.prototype.onError=function()
	{ 
		var map=this.mgr.map;
		this.stopLoad();
		this.error=true;
		this.mgr.imgErrorNumber++;
		//地圖瓦片出錯圖定莪在Map的errorImgUrl
		if(map.errorImgUrl){this.img.src=map.errorImgUrl;}
		if(!PG.Tool.isInDocument(this.img))
		{//添加圖片到頁面顯示
			this.mgr.getParentDiv(this.id).appendChild(this.img);
		}
		PG.Event.trigger(map,"imageerror",[this]);
	};

	/**
		銷毀地圖瓦片 
	*/
	PG.MapTile.prototype.depose=function(){
		this.stopLoad();
		this.mgr=null;
		PG.Event.deposeNode(this.img);
		this.img=null;
	};

	/**
		地圖瓦片管理對像

		map				地圖對像
		imgSize			地圖瓦片大小
		bufferNumber	地圖瓦片最大緩存數量
	*/
	function MapTileMgr(map,imgSize,bufferNumber)
	{
		this.map=map;
		this.imgSize=imgSize;
		this.bufferNumber=bufferNumber;
		this.mapImages=[];//存放正顯示的地圖瓦片---徐金評
		this.bufferImages=[];//存放已經加載了的地圖瓦片---徐金評
		this.imgNumber=0;
		this.imgErrorNumber=0;
		
		//保存每次地圖改變時需要加載的地圖瓦片信息,數據格式為[id,offset,flag,isEnd]
		//用於地圖滑動瓦片全部加載後，一次性顯示地圖瓦片(請參考PG.Map.prototype.slideEnd)
		this.slideImgs = [];
	}
	PG.MapTileMgr = MapTileMgr;

	/**
		得到圖片的父節點
	*/
	PG.MapTileMgr.prototype.getParentDiv=function(id)
	{
		return this.map["mapsDiv_"+id[2]];
	};

	/**
		得到地圖瓦片名稱
		id為數組,格式為[x,y,zoom]
	*/
	PG.MapTileMgr.prototype.getTileName=function(id)
	{
		return "IMG_"+id[0]+"_"+id[1]+"_"+id[2];
	};

	/**
		加載map地圖圖片的主方法
		
		id為數組,格式為[x,y,zoom]---徐金評
		offset為數組,格式為[x,y],用於計算圖片的位置(left和top)---徐金評
		flag為true代表初始化或改變縮放等級,將當前中心點變為區域中心點
		isEnd用於標誌圖片全部加載完成
	*/
	PG.MapTileMgr.prototype.showTile=function(id,offset,flag,isEnd)
	{//在緩存中的需要觸發showimg的圖片塊號,縮放結束再觸發showimg		
		//slideObject為滑動對像
		if(this.map.slideObject){
			if(id[2]==this.map.zoomIndex){
				this.slideImgs.push([id,offset,flag,isEnd]);
			}
		}
		var imageName=this.getTileName(id);

//		計算圖片的位置(left和top)---徐金評	
		var position = [(id[0]*this.imgSize)+parseInt(offset[0]),((id[1])*this.imgSize+parseInt(offset[1]))];		
				
		var tile=this.mapImages[imageName];		
		//如果已經顯示,則只要改變此瓦片的位置
		if(tile)
		{
			if(flag){
				PG.Tool.setPosition(tile.img,position);
				//FF縮放恢復大小
				if(PG.Tool.isImgZoom()){
					PG.Tool.SetSize(tile.img,[this.imgSize,this.imgSize]);
				}
				tile.img.pstion = position;
			}
			return;
		}		
		tile=this.bufferImages[imageName];
		//如果已經存在,說明此id的瓦片已經加載過了,直接顯示
		if(tile)
		{
			this.getParentDiv(id).appendChild(tile.img);//添加圖片到頁面顯示
			this.mapImages[imageName]=tile;
			PG.Tool.setPosition(tile.img,position);
			//FF縮放恢復大小
			if(PG.Tool.isImgZoom()){
				PG.Tool.SetSize(tile.img,[this.imgSize,this.imgSize]);
			}
			tile.img.pstion = position;
			this.imgNumber++;
			PG.Event.trigger(this.map,"imagechange",[tile.img,2]);
			return;
		}
		else
		{
//			縮放結束時再加載圖片,提高性能
			if(PG.Tool.isImgZoom()&&this.map.slideObject){
				this.slideImgs.push([id,offset,flag,isEnd]);
			}else{
				tile=new PG.MapTile(this,this.map.getMapImagesUrl(id[0],id[1],this.map.zoomLevels[id[2]]),position,id);
				tile.img.pstion = position;
				this.mapImages[imageName]=tile;
			}
		}
	};

	/**
		隱藏地圖瓦片
	*/
	PG.MapTileMgr.prototype.hideTile=function(tile)
	{
		tile.stopLoad();
		var flag=false;
		if(PG.Tool.isInDocument(tile.img))
		{
			if(tile.loaded)
			{
				this.imgNumber--;
				flag=true;
			}
			tile.img.parentNode.removeChild(tile.img);
		}
		if(tile.error){this.imgErrorNumber--;}
		PG.Event.trigger(this.map,"imagechange",[tile.img,3]);
		delete this.mapImages[tile.name];
		if(!flag)
		{
			PG.Event.deposeNode(tile.img);
			tile.mgr=null;
			tile.depose();
		}
	};
	window.PG.MapTile=PG.MapTile;
	window.PG.MapTileMgr=PG.MapTileMgr;
}
MapNSMapTile();