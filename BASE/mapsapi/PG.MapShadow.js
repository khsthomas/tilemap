/**
	  @author Administrator
	  高度最大值為380,寬度最大值為800,	寬高最小值為:this.minAreaSize=[284,102];
	  最小寬度下,高度最大只能到329
*/
function NSMapShadow(){

	function MapShadow(){
		this.imgSrc=window.PG._IMG_PATH+"iw/iws3.png";
	
		this.mainDiv=document.createElement("div");
		PG.Tool.setCssText(this.mainDiv,'position: absolute');
		
		this.leftTopDiv=document.createElement("div");
			PG.Tool.setCssText(this.leftTopDiv,'overflow: hidden; width: 70px; height: 30px; position: absolute; left: 40px; top: 0px;');
			this.leftTopImg=document.createElement("img");
			PG.Tool.setCssText(this.leftTopImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -323px; top: 0px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.leftTopImg,this.imgSrc);
			this.leftTopDiv.appendChild(this.leftTopImg);
			this.mainDiv.appendChild(this.leftTopDiv);
		
		this.rightTopDiv=document.createElement("div");
			PG.Tool.setCssText(this.rightTopDiv,'overflow: hidden; width: 70px; height: 30px; position: absolute; left: 224px; top: 0px;');
			this.rightTopImg=document.createElement("img");
			PG.Tool.setCssText(this.rightTopImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -1033px; top: 0px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.rightTopImg,this.imgSrc);
			this.rightTopDiv.appendChild(this.rightTopImg);
			this.mainDiv.appendChild(this.rightTopDiv);
			
		this.leftBottomDiv=document.createElement("div");
			PG.Tool.setCssText(this.leftBottomDiv,'overflow: hidden; width: 70px; height: 60px;position: absolute; left: 0px; top: 41px');
			this.leftBottomImg=document.createElement("img");
			PG.Tool.setCssText(this.leftBottomImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -14px; top: -310px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.leftBottomImg,this.imgSrc);
			this.leftBottomDiv.appendChild(this.leftBottomImg);
			this.mainDiv.appendChild(this.leftBottomDiv);
			
		this.rightBottomDiv=document.createElement("div");
			PG.Tool.setCssText(this.rightBottomDiv,'overflow: hidden; width: 70px; height: 60px; position: absolute; left: 214px; top: 41px');
			this.rightBottomImg=document.createElement("img");
			PG.Tool.setCssText(this.rightBottomImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -754px; top: -310px; width: 1144px; height: 370px; -moz-user-select: none;');
			PG.MapShadow.setPngSrc(this.rightBottomImg,this.imgSrc);
			this.rightBottomDiv.appendChild(this.rightBottomImg);
			this.mainDiv.appendChild(this.rightBottomDiv);
			
		this.arrowDiv=document.createElement("div");
			PG.Tool.setCssText(this.arrowDiv,' overflow: hidden; width: 140px; height: 60px;  position: absolute; left: 72px; top: 41px');
			this.arrowImg=document.createElement("img");
			PG.Tool.setCssText(this.arrowImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -119px; top: -310px; width: 1144px; height: 370px; -moz-user-select: none;');
			PG.MapShadow.setPngSrc(this.arrowImg,this.imgSrc);
			this.arrowDiv.appendChild(this.arrowImg);
			this.mainDiv.appendChild(this.arrowDiv);
			
		this.leftTopSecondDiv=document.createElement("div");
			PG.Tool.setCssText(this.leftTopSecondDiv,' overflow: hidden; position: absolute; left: 110px; top: 0px; width: 114px; height: 30px');
			this.mainDiv.appendChild(this.leftTopSecondDiv);
			this.leftSecondInnerDiv=document.createElement("div");
			PG.Tool.setCssText(this.leftSecondInnerDiv,'overflow: hidden; width: 640px; height: 30px');
			this.leftTopSecondDiv.appendChild(this.leftSecondInnerDiv);
			this.leftSecondImg=document.createElement("img");
			PG.MapShadow.setPngSrc(this.leftSecondImg,this.imgSrc);
			PG.Tool.setCssText(this.leftSecondImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -393px; top: 0px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.leftSecondImg,this.imgSrc);
			this.leftSecondInnerDiv.appendChild(this.leftSecondImg);
			
		this.middleLeftDiv=document.createElement("div");
			PG.Tool.setCssText(this.middleLeftDiv,'overflow: hidden; width: 131px; height: 11px; bottom: -1px; position: absolute; left: 29px; top: 30px');
			this.mainDiv.appendChild(this.middleLeftDiv);
			this.middleLeftImg=document.createElement("img");
			this.middleLeftDiv.appendChild(this.middleLeftImg);
			PG.Tool.setCssText(this.middleLeftImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -312px; top: -30px; -moz-user-select: none; width: 1144px; height: 370px');
			PG.MapShadow.setPngSrc(this.middleLeftImg,this.imgSrc);
			
		this.middleRightDiv=document.createElement("div");
			PG.Tool.setCssText(this.middleRightDiv,'overflow: hidden; width: 131px; height: 11px; bottom: -1px; position: absolute; left: 243px; top: 30px');
			this.mainDiv.appendChild(this.middleRightDiv);
			this.middleRightImg=document.createElement("img");
			PG.Tool.setCssText(this.middleRightImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -1052px; top: -30px; -moz-user-select: none; width: 1144px; height: 370px');
			this.middleRightDiv.appendChild(this.middleRightImg);
			PG.MapShadow.setPngSrc(this.middleRightImg,this.imgSrc);
			
		this.bottomSecondDiv=document.createElement("div");
			PG.Tool.setCssText(this.bottomSecondDiv,' overflow: hidden; position: absolute; left: 70px; top: 41px; width: 2px; height: 60px');
			this.mainDiv.appendChild(this.bottomSecondDiv);
			this.bottomSecondInnerDiv=document.createElement("div");
			PG.Tool.setCssText(this.bottomSecondInnerDiv,'overflow: hidden; width: 320px; height: 60px');
			this.bottomSecondDiv.appendChild(this.bottomSecondInnerDiv);
			this.bottomSecondImg=document.createElement("img");
			PG.Tool.setCssText(this.bottomSecondImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -345px; top: -310px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.bottomSecondImg,this.imgSrc);
			this.bottomSecondInnerDiv.appendChild(this.bottomSecondImg);
			
		this.bottomFourthDiv=document.createElement("div");
			PG.Tool.setCssText(this.bottomFourthDiv,'overflow: hidden; position: absolute; left: 212px; top: 41px; width: 2px; height: 60px');
			this.mainDiv.appendChild(this.bottomFourthDiv);
			this.bottomFourthInnerDiv=document.createElement("div");
			this.bottomFourthDiv.appendChild(this.bottomFourthInnerDiv);
			PG.Tool.setCssText(this.bottomFourthInnerDiv,'overflow: hidden; width: 320px; height: 60px');
			this.bottomFourthImg=document.createElement("img");
			PG.Tool.setCssText(this.bottomFourthImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -345px; top: -310px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.bottomFourthImg,this.imgSrc);
			this.bottomFourthInnerDiv.appendChild(this.bottomFourthImg);
			
		this.middleSecondDiv=document.createElement("div");
			PG.Tool.setCssText(this.middleSecondDiv,' overflow: hidden; position: absolute; left: 160px; top: 30px; width: 83px; height: 11px');
			this.mainDiv.appendChild(this.middleSecondDiv);
			this.middleSecondInnerDiv=document.createElement("div");
			PG.Tool.setCssText(this.middleSecondInnerDiv,'overflow: hidden; width: 640px; height: 598px');
			this.middleSecondDiv.appendChild(this.middleSecondInnerDiv);
			this.middleSecondImg=document.createElement("img");
			this.middleSecondInnerDiv.appendChild(this.middleSecondImg);
			PG.Tool.setCssText(this.middleSecondImg,'border: 0px none ; margin: 0px; padding: 0px; position: absolute; left: -360px; top: -30px; width: 1144px; height: 370px; -moz-user-select: none');
			PG.MapShadow.setPngSrc(this.middleSecondImg,this.imgSrc);
		//這個時候投影佔用的範圍為
		this.minAreaSize=[284,102];
		this.rssize=[this.minAreaSize[0],this.minAreaSize[1]];
		//箭頭所指的位置的坐標
		this.arrowPoint=[72,101];
		
	}
	PG.MapShadow = MapShadow;
	
	/**
		初始設置的大小為最小值,在這裡根據需要進行增加
		初始大小大約為:height:60+41=102	   width:214+70=284		
	*/	
	PG.MapShadow.prototype.SetSize=function(width,height){
		
	};

	/**
		判斷是否大小0		
	*/
	PG.MapShadow.prototype.abs = function(num){
		return num<0?0:num;
	};

	/**
		如果同時設置寬高的話最好先設置高,因為設置高會驗證中間第二塊的寬度合法性,而設置寬度的時候不驗證
		如果報錯的話基本是由於中間第二塊div的賦值為負
		
	*/
	PG.MapShadow.prototype.setHeight=function(height){
		height=parseInt(height);
		if(height<this.minAreaSize[1]){
			height=this.minAreaSize[1];
		}
		if(height>380){
			height=380;
		}
		
		var addHeight=height-this.rssize[1];
		//下移下面的div,大小不用變動
		this.leftBottomDiv.style.top=parseInt(this.leftBottomDiv.style.top)+addHeight+"px";
		this.rightBottomDiv.style.top=parseInt(this.rightBottomDiv.style.top)+addHeight+"px";
		this.arrowDiv.style.top=parseInt(this.arrowDiv.style.top)+addHeight+"px";
		this.bottomSecondDiv.style.top=parseInt(this.bottomSecondDiv.style.top)+addHeight+"px";
		this.bottomFourthDiv.style.top=parseInt(this.bottomFourthDiv.style.top)+addHeight+"px";
		//右移上面的div,大小不用變動,由於為45度斜率,所以增量和高度一樣
		this.leftTopDiv.style.left=parseInt(this.leftTopDiv.style.left)+addHeight+"px";
		this.rightTopDiv.style.left=parseInt(this.rightTopDiv.style.left)+addHeight+"px";
		this.leftTopSecondDiv.style.left=parseInt(this.leftTopSecondDiv.style.left)+addHeight+"px";
		//移動中間的三塊div,高度改變,左右兩塊的位置不動,改變裡面image的偏移,(有可能會改變左右兩塊div的寬度),中間div的大小根據左右兩塊計算得來
		//左邊,寬度保持高度+26
		this.middleLeftDiv.style.height=this.abs(parseInt(this.middleLeftDiv.style.height)+addHeight)+"px";
		this.middleLeftDiv.style.width=this.abs(parseInt(this.middleLeftDiv.style.height)+26)+"px";
		this.middleLeftImg.style.left=parseInt(this.middleLeftImg.style.left)+addHeight+"px";
		//右邊,寬度保持高度+26
		this.middleRightDiv.style.height=this.abs(parseInt(this.middleRightDiv.style.height)+addHeight)+"px";
		this.middleRightDiv.style.width=this.abs(parseInt(this.middleRightDiv.style.height)+26)+"px";
		this.middleRightImg.style.left=parseInt(this.middleRightImg.style.left)+addHeight+"px";
		//改變高度,中間寬度根據左右計算得來
		this.middleSecondDiv.style.height=this.abs(parseInt(this.middleSecondDiv.style.height)+addHeight)+"px";
		var midDivWidth=parseInt(this.middleRightDiv.style.left)-parseInt(this.middleLeftDiv.style.width)-parseInt(this.middleLeftDiv.style.left);
		var extendWidth=midDivWidth;
		if(midDivWidth<0){
			midDivWidth=0;
		}
		this.middleSecondDiv.style.width=this.abs(midDivWidth)+"px";
		this.middleSecondDiv.style.left=parseInt(this.middleLeftDiv.style.width)+parseInt(this.middleLeftDiv.style.left)+"px";
		
		this.rssize[1]=height;

		//如果寬度不夠就對寬度進行擴充
		if(extendWidth<0){
			this.setWidth(-extendWidth+this.minAreaSize[0]);
			this.middleSecondDiv.style.width=this.abs(parseInt(this.middleRightDiv.style.left)-parseInt(this.middleLeftDiv.style.left)-parseInt(this.middleLeftDiv.style.width))+"px";
		}
	};

	/**
		設置寬度		
	*/
	PG.MapShadow.prototype.setWidth=function(width){
		width=parseInt(width);
		if(width<this.minAreaSize[0]){
			width=this.minAreaSize[0];
		}
		if(width>800){
			width=800;
		}
		//防止下面計算箭頭位置的時候出現小數
		if(width%2==1)width++;
		var addWidth=width-this.rssize[0];
		//右面的一列div大小不變,平移
		this.rightTopDiv.style.left=parseInt(this.rightTopDiv.style.left)+addWidth+"px";
		this.middleRightDiv.style.left=parseInt(this.middleRightDiv.style.left)+addWidth+"px";
		this.rightBottomDiv.style.left=parseInt(this.rightBottomDiv.style.left)+addWidth+"px";
		//中間的一列div的left不變,寬度增加addWidth即可
		this.leftTopSecondDiv.style.width=this.abs(parseInt(this.leftTopSecondDiv.style.width)+addWidth)+"px";
		this.middleSecondDiv.style.width=this.abs(parseInt(this.middleSecondDiv.style.width)+addWidth)+"px";
		//計算箭頭左右分配的寬度
		var halfW=(parseInt(this.rightBottomDiv.style.left)+parseInt(this.rightBottomDiv.style.width))/2;
		//左下第二個div應該分配的寬度
		//102+x=152+y  x+y=140解這兩個方程組得x=95   y=45如果想讓箭頭的根部在中間,左右分配的像素大約就是那兩個數字
		var leftBottomSecondWidth = halfW-parseInt(this.leftBottomDiv.style.width)-95;
		
		if(leftBottomSecondWidth<2){
//			下方第二塊最小為2px
			this.bottomSecondDiv.style.width="2px";
//			重新移動箭頭
			this.arrowDiv.style.left=parseInt(this.bottomSecondDiv.style.width)+parseInt(this.bottomSecondDiv.style.left)+"px";
//			算出下方第四塊的寬度和偏移
			var rightDecrease = 2-leftBottomSecondWidth;
			this.bottomFourthDiv.style.width=this.abs(halfW-parseInt(this.leftBottomDiv.style.width)-45 - rightDecrease)+"px";
			this.bottomFourthDiv.style.left=parseInt(this.arrowDiv.style.width)+parseInt(this.arrowDiv.style.left)+"px";
//			中間第二塊和第三塊
//			this.middleSecondDiv.style.width=parseInt(this.middleSecondDiv.style.width)+addWidth-rightDecrease;
//			this.middleRightDiv.style.left=parseInt(this.middleRightDiv.style.left)+addWidth-rightDecrease;
//			top第二塊和第三塊
//			this.rightTopDiv.style.left=parseInt(this.rightTopDiv.style.left)+addWidth-rightDecrease;
//			this.leftTopSecondDiv.style.width=parseInt(this.leftTopSecondDiv.style.width)+addWidth-rightDecrease;
			
		}else{
			this.bottomSecondDiv.style.width=this.abs(leftBottomSecondWidth)+"px";
			//箭頭的left移動量
			this.arrowDiv.style.left=parseInt(this.bottomSecondDiv.style.width)+parseInt(this.bottomSecondDiv.style.left)+"px";
			//左下第四塊div的寬度,還有橫向移動的距離
			this.bottomFourthDiv.style.width=this.abs(halfW-parseInt(this.leftBottomDiv.style.width)-45)+"px";
			this.bottomFourthDiv.style.left=parseInt(this.arrowDiv.style.width)+parseInt(this.arrowDiv.style.left)+"px";
		}

		this.rssize[0]=width;

	};

	/**
		箭頭指向的點與起始點的偏移		
	*/
	PG.MapShadow.prototype.getArrowOffset=function(){
		var x=parseInt(this.arrowDiv.style.left);
		var y=parseInt(this.arrowDiv.style.top)+parseInt(this.arrowDiv.style.height);
		return arrowPosition=[x,y];
	};

	/**
		重設為最小,在大小變化之前先重設為最小,如果是不是最小的話		
	*/
	PG.MapShadow.prototype.toMinSize=function(){
		this.setHeight(this.minAreaSize[1]);
		this.setWidth(this.minAreaSize[0]);
	};

	/**
		設置濾鏡或者非濾鏡		
	*/
	PG.MapShadow.setPngSrc=function(obj,imgsrc){
		if(PG.Tool.browserInfo().isIE6){
			obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgsrc+"',sizingMethod='crop')";
			obj.style.overflow="hidden";
			obj.src=window.PG._map_maskBackgroundURL;
		}else{
			obj.src=imgsrc;
		}
	};

	/**
		綁定到信息框---改變陰影的一個核心方法
	
	*/
	PG.MapShadow.prototype.bindInfoWin=function(mapWin){
		this.mapWin=mapWin;
		//寫死一個偏移(向下偏移)---改變陰影的一個核心變量
		this.topOffset=25;
		//寫死一個寬度增量,大約是增加70就達到了infowin的寬度---改變陰影的一個核心變量
		this.widthOffset=-15;
		
		this.mapWin.div.insertBefore(this.mainDiv,this.mapWin.div.firstChild);

		this.listeners = [PG.Event.bind(this.mapWin,"initialize",this,this.onMapWinInitialize),
			PG.Event.bind(this.mapWin,"resize",this,this.onMapWinSizeChange),
			PG.Event.bind(this.mapWin,"close",this,this.onMapWinClose),
			PG.Event.bind(this.mapWin,"remove",this,this.onMapWinRemove),
			PG.Event.bind(this.mapWin,"depose",this,this.onMapWinDepose)];
	};

	/**
		在infowin大小變化時跟隨變化	---改變陰影的一個核心方法 
		
	*/
	PG.MapShadow.prototype.onMapWinSizeChange=function(rssize){
		this.toMinSize();
		this.setHeight(rssize[1]/1.414);
		//this.setWidth(rssize[0]+this.widthOffset);
		this.setWidth(rssize[0]+this.widthOffset);
		
//		偏移
		var anchorPos=this.mapWin.getAnchorPoint();
		var shadowPos=this.getArrowOffset();
		this.mainDiv.style.left=-shadowPos[0]-anchorPos[0]-20+"px";
		this.mainDiv.style.top=-shadowPos[1]-anchorPos[1]+this.topOffset+"px";
		
	};

	/**
		初始化		
	*/
	PG.MapShadow.prototype.onMapWinInitialize=function(){
		
	};

	/**
		銷毀		
	*/
	PG.MapShadow.prototype.onMapWinDepose=function(){
		this.mapWin=null;
		if(this.mainDiv.parentNode){
			this.mainDiv.parentNode.removeChild(this.mainDiv);
		}
		var listener;
		while(listener=this.listeners.pop())
		{
			PG.Event.removeListener(listener);
		}
		PG.Event.deposeNode(this.mapWin);
	};

	/**
				
	*/
	PG.MapShadow.prototype.onMapWinClose=function(){
		
	};

	/**
				
	*/
	PG.MapShadow.prototype.onMapWinRemove=function(){

	};
	
	window.PG.MapShadow=PG.MapShadow;	
}
NSMapShadow();
