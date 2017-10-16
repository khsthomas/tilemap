/**
	本文件是JS API之中的PG.LogoControl,PG.BseiDigControl,PG.CopyrightControl類

*/
function NSLogoControl(){
	function LogoControl(html)
	{
		var div=PG.Tool.createDiv(1,null,1200);
		var style=div.style;
		style.position = "absolute";
		//定莪位置
		style.left="0px";
		style.bottom="0px";
		style.width = "360px";
		style.height = "18px";
		style.color="#9A770E";
		style.fontSize="12px";
		style.paddingTop="2px";
		style.backgroundColor = "";
		div.style.width = "auto";//根據文字大小自適應
		div.style.paddingRight = "4px";
		div.innerHTML=html;
		if(PG.Tool.browserInfo().isIE6){
			var p_c=div.getElementsByTagName('IMG');
			if(p_c&&p_c.length>0){
				p_c[0].style.backgroundImage='';
			}
		}
	
		PG.Event.addListener(div,"mousedown",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(div,"selectstart",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		PG.Event.addListener(div,"click",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		this.div=div;
	}
	PG.LogoControl = LogoControl;
	
	/**
		初始化控件		
	*/
	PG.LogoControl.prototype.initialize=function(map)
	{
		this.map=map;
	};

	/**
		返回容器
	*/
	PG.LogoControl.prototype.getObject=function()
	{
		return this.div;
	};	
		
	/**
		審圖號控件
	*/
	function BseiDigControl(){
		var html = '&nbsp;<a style="font-size: 11px; color: #000; font-family: arial; text-decoration: none;">&copy; 2012 pilotgaea </a>';
		var config = {position:[1,1],bgcolor:"transparent"};
		PG.LogoControl.apply(this,[html,config]);
		PG.Tool.inherit(this,PG.LogoControl.prototype);
		this.initialize = PG.BseiDigControl.prototype.initialize;
		PG.Event.bind(PG.OverviewMapControl,"overviewBuild",this,this.onOverviewMapBuild);
		this.div.style.width = "auto";
		this.div.style.height = "auto";
		this.div.style.left="70px";
		this.div.style.paddingTop="0px";
		this.div.style.marginBottom="3px";
		
	}
	PG.BseiDigControl = BseiDigControl;
	
	/**
		鷹眼控件創建時觸發
		改變PG.BseiDigControl控件位置,並綁定鷹眼事件以及時改變位置
	*/
	PG.BseiDigControl.prototype.onOverviewMapBuild=function(obj){
		if(!(obj.direction==0||obj.direction==4)){return;}
		this.overviewMap = obj;
		if(this.overviewMap.IsOpen()){
			this.div.style.right=this.overviewMap.size[0]+10+"px";
		}else{
			this.div.style.right=30+10+"px";
		}
		this.listeners=[
			PG.Event.bind(this.overviewMap,"sizechange",this,this.onOverviewMapSizeChange),
			PG.Event.bind(this.overviewMap,"OnViewChange",this,this.onViewchange),
			PG.Event.bind(this.overviewMap,"remove",this,this.onRemove)
		];
		
	};

	/**
		初始化控件		
	*/
	PG.BseiDigControl.prototype.initialize=function(map)
	{
		this.map=map;
	};

	/**
		鷹眼控件大小改變時觸發
	*/
	PG.BseiDigControl.prototype.onOverviewMapSizeChange=function(overviewsize){
		var wdth = overviewsize[0];
		if(wdth<30){wdth=30;}
		this.div.style.right=wdth+10+"px";		
	};
	
	/**
		鷹眼控件視圖區域改變時觸發
	*/
	PG.BseiDigControl.prototype.onViewchange=function(isshow,e){
		if(!isshow&&!e){this.div.style.right=30+"px";}
	};
	
	/**
		刪除
	*/
	PG.BseiDigControl.prototype.onRemove=function(obj){
		this.div.style.right=30+"px";
		var list;
		while(list = this.listeners.pop()){
			PG.Event.removeListener(list);
		}
		this.overviewMap = null;
	};
	
	/**
		版權控件		
	*/
	function CopyrightControl()
	{
		this.div = PG.Tool.createDiv(1);
		this.htmlControl =  new PG.HtmlElementControl(this.div);
		PG.Tool.inherit(this,this.htmlControl);
		this.initialize = PG.CopyrightControl.prototype.initialize;
		this.remove = PG.CopyrightControl.prototype.remove;
		this.depose = PG.CopyrightControl.prototype.depose;		
		PG.Tool.setUnSelectable(this.div);		
		this._copys = [];
		
	}
	PG.CopyrightControl = CopyrightControl;

	/**
		初始化版權控件		
	*/
	PG.CopyrightControl.prototype.initialize=function(map)
	{
		this.map=map;
		this.vListener = PG.Event.bind(this.map,"OnMove",this,this.verify);
		this.verify(map.GetCenter());
	};

	/**
		版權控件核實 		
	*/
	PG.CopyrightControl.prototype.verify = function(lnglat){
		if(!this.map){return;}
		for(var i=0;i<this._copys.length;i++){
			if(this._copys[i].rectangle){
				if(this._copys[i].rectangle.ContainsPoint(lnglat)){
					if(this._copys[i]._span.style.display == "none"){
						this._copys[i]._span.style.display = "";
					}
				}else{
					this._copys[i]._span.style.display = "none";
				}
			}
		}
	};
	
	/**
		添加版權信息	
		參數copyright為一個對像,格式為{id:1,content:"",rectangle:new PG.LngLatBounds()}
	*/
	PG.CopyrightControl.prototype.AddCopyright=function(copyright)
	{
		if(this._copys["str"+copyright.id]){
			alert("copyright id 重複");
			return;
		}
		this._copys.push(copyright);
		this._copys["str"+copyright.id] = copyright;
		var sp = document.createElement("span");
		sp.style.font = "11px arial,mingliu";
		sp.innerHTML = copyright.content;
		copyright._span = sp;
		this.div.appendChild(sp);
	};

	/**
		根據id返回刪除版權信息			
	*/
	PG.CopyrightControl.prototype.RemoveCopyright=function(id)
	{
		this.div.removeChild(this._copys["str"+copyright.id]._span);
		this._copys["str"+copyright.id] = null;
		for(var i=0;i<this._copys.length;i++){
			if(this._copys[i].id==id){
				this._copys.splice(i,1);
				break;
			}
		}		
	};

	/**
		根據id返回所有的版權信息			
	*/
	PG.CopyrightControl.prototype.GetCopyright=function(id)
	{
		return this._copys["str"+id];
	};

	/**
		返回所有的版權信息		
	*/
	PG.CopyrightControl.prototype.GetCopyrightCollection=function()
	{
		return this._copys;
	};

	/**
		刪除		
	*/
	PG.CopyrightControl.prototype.remove=function()
	{
		this.map=null;
		if(this.vListener){
			PG.Event.removeListener(this.vListener);
			this.vListener = null;
		}
	};

	/**
		銷毀版權控件		
	*/
	PG.CopyrightControl.prototype.depose=function()
	{
		this.div._control=null;
		PG.Event.deposeNode(this.div);
		this.div=null;
	};

	function PositionControl()
	{
		var div=PG.Tool.createDiv(1,null,1500);
		var style=div.style;
		style.position = "absolute";
		style.opacity = 0.6;
		style.fontWeight="900";
		//定莪位置
		style.right="0px";
		style.top="0px";
		style.width = "360px";
		style.height = "12px";
		style.color="#9A770E";
		style.fontSize="12px";
		style.paddingTop="2px";
		style.backgroundColor = "yellow";
		div.style.width = "auto";//根據文字大小自適應
		div.style.paddingRight = "4px";
		div.innerHTML="<span id=\"PGPC_map_coor_name\"></span>&nbsp;:<span id=\"PGPC_map_coor_x\"></span>&nbsp;,&nbsp;<span id=\"PGPC_map_coor_y\"></span>";
		if(PG.Tool.browserInfo().isIE6){
			var p_c=div.getElementsByTagName('IMG');
			if(p_c&&p_c.length>0){
				p_c[0].style.backgroundImage='';
			}
		}
		this.FixFloat=5;
		this.div=div;
	}
	PG.PositionControl = PositionControl;
	
	/**
		初始化控件		
	*/
	PG.PositionControl.prototype.initialize=function(map)
	{
		this.map=map;
		var pt=this.map.GetCenter();
		this.setXY(this.GetSetXY(pt.GetX(),pt.GetY()));
		PG.Event.bind(this.map,"OnMouseMove",this,this.getMouseXY);
		//PG.Event.bind(this.map,"OnMouseOver",this,this.setXY);
		//PG.Event.addListener(this.div,"mousedown",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		//PG.Event.addListener(this.div,"selectstart",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
		//PG.Event.addListener(this.div,"click",PG.Event.returnTrue);//指定控件層的mousedown事件返回true
	};

	/**
		返回容器
	*/
	PG.PositionControl.prototype.getObject=function()
	{
		return this.div;
	};
	/**
		返回容器
	*/
	PG.PositionControl.prototype.getMouseXY=function(pt,btn)
	{
		pt=this.map.WindowToWorld(pt);
		this.setXY(this.GetSetXY(pt.GetX(),pt.GetY()));
		return this.div;
	};
	/**
	 * 	設定座標函數
	 */
	PG.PositionControl.prototype.GetSetXY=function(x,y)
	{
		return ["",x,y];
	}	
	/**
	 * 	設定座標
	 */
	PG.PositionControl.prototype.setXY=function(xy)
	{
		var s_c=this.div.getElementsByTagName('span');
			if(s_c&&s_c.length>0){
				s_c[0].innerHTML=xy[0]
				s_c[1].innerHTML=parseFloat(xy[1]).toFixed(this.FixFloat);
				s_c[2].innerHTML=parseFloat(xy[2]).toFixed(this.FixFloat);
			}
		//document.getElementById('_map_coor_x').innerHTML=x;
		//document.getElementById('_map_coor_y').innerHTML=y;
	}
	PG.PositionControl.prototype.SetFF=function(f)
	{
		this.FixFloat=f;
	}
	PG.PositionControl.prototype.SetFontColor=function(color)
	{
		this.div.style.color=color;
	}
	PG.PositionControl.prototype.SetOpacity=function(f)
	{
		this.div.style.opacity=f;
	}	
	window.PG.LogoControl=PG.LogoControl;
	window.PG.BseiDigControl=PG.BseiDigControl;	
	window.PG.CopyrightControl = PG.CopyrightControl;
	window.PG.PositionControl = PG.PositionControl;
}
NSLogoControl();	
	
