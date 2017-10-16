package test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class T5 {
	/*
	 
	 E:/JAVA_WorkSpace/se_javascriptapi3_taiwan/SRC/
	 
	 E:/jsencrypt/js11/
	 
	 */
	private static final String API_PATH = "E:/jsencrypt/js11/";

	private static String[] MapsGroup=new StringBuffer()	
	.append("Icon,DivIcon,Entity,WindowEntity,PointEntity,MarkEntity,PolyLineEntity,")
	.append("PolygonEntity,RectEntity,EllipseEntity,CircleEntity,Control,ScaleControl,")
	.append("HtmlElementControl,LogoControl,MapControl,ZoomInTool,ProgressControl,")
	.append("RectTool,EllipseTool,CircleTool,MarkTool,PolyLineTool,PolygonTool,")
	.append("MapTile,MapTileMgr,OverviewMapControl,OverviewMap,")
	.append("MapEffect,BseiDigControl,Layer256Overlay,MapTypeControl,")
	.append("TileLayer,MapShadow,IconShadow,MagnifyingglassControl,MapType,")
	.append("CenterCrossControl,EdittingMPolyLine,WindowEntityTab,ContextMenu,")
	.append("MenuItem,CopyrightControl,Map,")
	.append("Event,ObjectLoader,Ajax,Tool,BrowserInfo,Geo,Point,Rect,")
	.append("Polyline,PolygonSet,Polygon,Size,")
	.toString().split(",");
	//private static final String[] AJAXGroup="Event,ObjectLoader,Ajax,Tool,BrowserInfo,Geo,Point,Rect,Polyline,Polygon,PolygonSet,Size".split(",");
	
	/*
	 * 按照长度进行降序排序
	 * */
	private static void sortMapsGroup() throws Exception {		
		java.util.Arrays.sort(MapsGroup, new Comparator(){

			/* (non-Javadoc)
			 * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
			 */
			@Override
			public int compare(Object o1, Object o2) {
				// TODO Auto-generated method stub
				int a = o1.toString().length();
				int b = o2.toString().length();				
				return a>b?-1:(a==b?0:1);
			}		
			
		});
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		try {
			sortMapsGroup();
			
			ObsNamesConfig usedNames = new ObsNamesConfig();
			StringBuilder sb = new StringBuilder();
			sb.append("(function(){");
			//名字空间
			sb.append("window.PG=window.PG||{};");
			sb.append("var "+usedNames.getName("window.PG.")+"=window.PG;");
			sb.append("var "+usedNames.getName("window.")+"=window;");
			sb.append("var "+usedNames.getName("document.")+"=document;");
			sb.append("var "+usedNames.getName("navigator.")+"=navigator;");			
			sb.append("var "+usedNames.getName("PG.")+"=PG;");
						
			
			String h_s_d = "ObsureFunctionDecodeString";//解压字符串的函数名			
			String h_s = "var "+usedNames.getName(h_s_d)+"=function(p){var a=0,s=0;var d=p.length;var f=new String();var g=-1;var h=0;for(var j=0;j<d;j++){var k=p.charCodeAt(j);k=(k==95)?63:((k==44)?62:((k>=97)?(k-61):((k>=65)?(k-55):(k-48))));s=(s<<6)+k;a+=6;while(a>=8){var l=s>>(a-8);if(h>0){g=(g<<6)+(l&(0x3f));h--;if(h==0){f+=String.fromCharCode(g);};}else{if(l>=224){g=l&(0xf);h=2;}else if(l>=128){g=l&(0x1f);h=1;}else{f+=String.fromCharCode(l);};};s=s-(l<<(a-8));a-=8;};};return f;};";
			sb.append(h_s);						
			
			String a = readF(API_PATH+"api/api_google_ge.js");
			//System.out.println(a);
			
			
			/*
			 \"(\\w)*\"
			 ^
			 */			
			ScriptEngineManager mgr = new ScriptEngineManager();    
			ScriptEngine engine = mgr.getEngineByExtension("js"); 
			FileReader fr = new FileReader(API_PATH+"h_s.js");			    
		    engine.eval(fr);
		    fr.close();
		    
			String g = "\"((\\w)*)\"";//[a-zA-Z]
			Pattern p = Pattern.compile(g);
			Matcher m = p.matcher(a);
			boolean b = m.find();
			String pa666 = null;
			String pa777 = null;
			while(true){
				if(!b){break;}		
				int s = m.start();
				int e = m.end();
				pa666 = a.substring(s, e);
				pa777 = pa666.substring(1, pa666.length()-1);								
				if(pa777.trim().length()>1){	
					String _h = usedNames.getName(h_s_d)+"(\""+testInvokeScriptMethod(engine,pa777)+"\")";						
					System.out.println(m.start()+"   "+m.end()+"  "+pa666+"  "+_h);					
					//a = a.replaceAll(pa666, _h);					
					//String p1 = a.substring(0, m.start());String p2 = a.substring(m.end());	a = p1 + _h + p2;					
					//a = a.replace(pa666, _h);
					a = new StringBuilder().append(a.substring(0, s)).append(_h).append(a.substring(e)).toString();
					m = p.matcher(a).region(s+_h.length(), a.length());
										
				}else{
					//System.out.println(m.start()+"   "+m.end()+"  "+a.substring(m.start(), m.end()));
				}				
				b = m.find();				
			}			
			//writeF(API_PATH+"/api/api_h_s.js",a);
			
			
			
			//String aa = a.replaceAll("window.PG", "A");
			Iterator<String> it = usedNames.getONNames().keySet().iterator();
			String oldN = null;
			String newN = null;
			String aa = "";
			int count = 0;
			while(it.hasNext()){
				count = 0;
				oldN = it.next();	
				newN = usedNames.getONNames().get(oldN);
				System.out.println("count = "+count+"  "+oldN+"  "+newN);
				int p6 = a.indexOf(oldN);
				while(p6!=-1){
					a = a.replace(oldN, newN+".");
					p6 = a.indexOf(oldN);
					count++;
					System.out.println("count = "+count+"  "+oldN+"  "+newN);
				}				
				
				//aa = aa.replaceAll(oldN, newN);	
				//sb.append("var "+handle1(k)+"="+handle1(v)+";");
			}
			
			//StringBuilder sb_f = new StringBuilder();
			
			String sys_pg = usedNames.getName("PG.")+".";			
			for (int i = 0; i < MapsGroup.length; i++) {
				count = 0;
				String o_n1 = MapsGroup[i];
				oldN = sys_pg+o_n1;			
				newN = "PG."+usedNames.getName(oldN);
				int p6 = a.indexOf(oldN);
				while(p6!=-1){					
					a = a.replace(oldN, newN);
					p6 = a.indexOf(oldN);
					count++;
					System.out.println("count = "+count+"  "+oldN+"  "+newN);
				}
				
				
				//prototype
				/*oldN = newN+".prototype";
				newN = usedNames.getName(oldN);
				p6 = a.indexOf(oldN);				
				if(p6!=-1){
					String p7 = a.substring(p6+oldN.length(), p6+oldN.length()+30);
					if((p7.indexOf("= function")!=-1)||(p7.indexOf("=function")!=-1)){
						
						String a1 = a.substring(0, p6)+"var "+newN+"="+oldN+";";
						String a2 = a.substring(p6);
						count = 0;
						p6 = a2.indexOf(oldN);
						while(p6!=-1){							
							a2 = a2.replace(oldN, newN);
							p6 = a2.indexOf(oldN);
							count++;
							System.out.println("count = "+count+"  "+oldN+"  "+newN);
						}
						a = a1 + a2;
					}				
					
				}*/
				
			}
			
			//System.out.println(aa);	 sb.append(aa);
			
			sb.append(a);
			sb.append("})();");
			
			writeF(API_PATH+"/api/api8888.js",sb.toString());
			
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/*
	 * 处理名字空间点号
	 * */
	private static String handle1(String k) throws Exception {		
		return (k.charAt(k.length()-1)=='.')?k.substring(0, k.length()-1):k;
	}
	
	private static String testInvokeScriptMethod(ScriptEngine engine,String a) throws Exception {  	    
	    Invocable inv = (Invocable) engine;  
	  //  String res = (String) inv.invokeFunction("functionDecodeString","Q7HqS3elBsKkSsrXSdHbON9qQ2vZRZevC30mBrD5Nr19KZzaPNDZFMvXTcbsPMDqTNHj9dLfP3rpRM5oT6LXSdHe");  
	   // System.out.println("res:" + res); 	     
	    
	    String res1 = (String) inv.invokeFunction("functionEncodeString",a);  
	   // System.out.println("handle string :" + a+"   "+res1);     
	    return res1;    
	}
	
		
	private static String writeF(String p,String c) throws Exception {
		
		  File fwf = new File(p);
		  if(fwf.exists()){fwf.delete();} FileWriter fw = new FileWriter(fwf);
		  fw.write(c);
		  fw.close();		 
		return "";

	}

	private static String readF(String p) throws Exception {

		StringBuilder sb = new StringBuilder();
		BufferedReader fis = new BufferedReader(new FileReader(p));
		String inputString;
		while ((inputString = fis.readLine()) != null) {
			sb.append(new String(inputString.getBytes(), "utf-8")).append("\n");
		}
		System.out.println("********************" + p + "********************");
		//System.out.println(sb.toString());

		fis.close();

		return sb.toString();

	}
	

}

class ObsNamesConfig{
	/*   old-new eg:PG-A */
	private static final char[] nameStartString="$QWERTYUIOPASDFGHJKLZXCVBNM".toCharArray();		//生成的变量使用的变量名称
	private static final char[] nameString="$QWERTYUIOPASDFGHJKLZXCVBNM_qwertyuiopasdfghjklzxcvbnm0123456789".toCharArray();	//生成的变量使用的变量名称
	private Map<String,String> namesN=new LinkedHashMap<String,String>();		//保存新变量名
	private int nameDigit=1;					//自动取变量的查找位数
	private int nameIndex=0;					//自动取变量的索引
	
	
	public ObsNamesConfig(){
		/*//JavaScript默认函数
		addNames("parseInt,GetObject,void,escape,eval,isFinite,isNaN,parseFloat,unescape,decodeURIComponent,encodeURIComponent,decodeURI,encodeURI".split(","));
		//JavaScript默认对象
		addNames("Image,ActiveXObject,Array,arguments,Boolean,Date,Enumerator,Error,Function,Global,Math,Number,Object,RegExp,String,VBArray".split(","));
		//JavaScript语法关键字
		addNames("with,while,var,try,catch,finally,throw,this,switch,return,Labeled,if,else,function,for,in,do,continue,break,case,do,false,debugger,true,with,default,null".split(","));
		//JavaScript语法关键字
		addNames("delete,instanceof,new,typeof,void".split(","));
		//浏览器默认对象
		addNames("window,clientInformation,clipboardData,document,event,external,history,location,navigator,screen".split(","));
		//浏览器默认方法
		addNames("alert,attachEvent,blur,clearInterval,clearTimeout,close,confirm,createPopup,detachEvent,execScript,focus,moveBy,moveTo,navigate,open,print,prompt,resizeBy,resizeTo,scroll,scrollBy,scrollTo,setActive,setInterval,setTimeout,showHelp,showModalDialog,showModelessDialog".split(","));
		//浏览器控制对象
		addNames("frames,top,status,self,screenTop,screenLeft,returnValue,parent,opener,offscreenBuffering".split(","));
		//FireFox对象
		addNames("DOMParser,XMLHttpRequest,XMLSerializer".split(","));*/
	}
	
	public Map<String,String> getONNames(){		
		return namesN;
	}
	
	//根据原有的变量名成返回新的变量名称，如果查找不到，则创建新的变量
	public String getName(String oName)
	{
		if(oName!=null)
		{
			String result=namesN.get(oName);
			if(result!=null){return result;}
		}
		String name=getNewName();
		addName(new String[]{oName,name});
		System.out.println("*****"+namesN.get(oName));
		return name;
	}	
	
	//自动生成一个新的可以使用的变量名
	public String getNewName()
	{
		String newName;
		int index;
		while(true)
		{
			newName="";
			index=nameIndex;
			for(int i=0;i<nameDigit;i++)//根据变量名称可使用的字符列表生成一个指定位数的变量
			{
				char[] str=(i==0)?nameStartString:nameString;
				int t=index%str.length;
				index=(index-t)/str.length;
				newName+=str[t];
			}
			if(!namesN.containsValue(newName)){break;}
			nameIndex++;

			//如果该位数的变量已经全部取完,则升位,重新取变量
			boolean flag = nameIndex>=nameStartString.length*Math.pow(nameString.length,nameDigit-1);
			if(flag)
			{
				nameIndex=0;
				nameDigit++;
			}
		}
		
		//System.out.println("nameIndex = " + nameIndex+"\tnameDigit = "+ nameDigit);
		return newName;
	}
	

	//向管理器之中添加一系列变量名
	public void addNames(String[] names)
	{
		for(int i=names.length-1;i>=0;i--){addName(names[i]);}
	}

	/**
		添加一个变量名

		参数name可能有两种情况:
		1,name是一个指定的变量名字符串,例如"obj"
		2,name是一个数组,包含原来的变量名和新的变量名,例如["obj","o"]	
	*/
	public void addName(String name)
	{
		namesN.put(name, name);
	}
	public void addName(String[] name)
	{
		namesN.put(name[0], name[1]);
	}	
	
}
