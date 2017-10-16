//动态加载js
function loadScript(url,afix){
	var head = document.getElementsByTagName("head")[0];		
	if(!head){head = document.documentElement;}
	var script = document.createElement("script");  
	script.src = url+afix+'.js';   
	head.appendChild(script);  
}  

var info=['info message'];
var url='/mobile/';//'http://127.0.0.1/mobile/';
var fs=['PG.CircleEntity','PG.RectEntity','PG.PolygonEntity','PG.PolygonEntityTool','PG.RectEntityTool','jquery'];
var webkit=PG.Tool.browserInfo().isMwk;//判断手机浏览器信息
if(webkit){
	info[0]='android or iphone';
	PG.PolygonEntity=null;
	for(var i=0;i<fs.length;i++){
		info.push('<br/>'+fs[i]);
		loadScript(url+fs[i],'.Mobile');
	}
}