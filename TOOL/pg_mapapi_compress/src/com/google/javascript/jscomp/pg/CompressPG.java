package com.google.javascript.jscomp.pg;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.javascript.jscomp.CommandLineRunner;

/**
 * @author xujinping 
 * xjpwyclear.happy@163.com
 * 
 * Compress Second.
 *
 */
public class CompressPG {

	/*private static String[] MapsGroup=new StringBuffer()	
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
	.append("Polyline,PolygonSet,Polygon,Size")
	.toString().split(",");*/
	
	/*
	 * 按照字符長度進行降序排序
	 * 
	 * */
	private static void sortMapsGroup() throws Exception {		
		java.util.Arrays.sort(ReadConfig.PG_MapsGroup_ALL, new Comparator(){

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
	
	/*
	 * 字符加密函數
	 * 
	 * str : 需要加密的字符串
	 * 
	 * */
	private static String functionEncodeString(String str){
		int num=0,byte1=0;
		int len=str.length();
		StringBuilder resultStr=new StringBuilder();
		for(int i=0;i<len;i++)
		{
			char code=str.charAt(i);
			if(code>=2048)		//0800 - FFFF 1110xxxx 10xxxxxx 10xxxxxx 
			{
				byte1=(byte1<<24)+(((code>>12)|0xe0)<<16)+((((code&0xfff)>>6)|0x80)<<8)+((code&0x3f)|0x80);
				num+=24;
			}
			else if(code>=128)	//0080 - 07FF 110xxxxx 10xxxxxx 
			{
				byte1=(byte1<<16)+(((code>>6)|0xc0)<<8)+((code&0x3f)|0x80);
				num+=16;
			}
			else			//0000 - 007F 0xxxxxxx 
			{
				num+=8;
				byte1=(byte1<<8)+code;
			}
			while(num>=6)
			{
				int b=byte1>>(num-6);
				byte1=byte1-(b<<(num-6));
				num-=6;
				/*
					b	0-9		數字0-9		b+48
					b	10-35	字母A-Z		b+65-10=b+55
					b	36-61	字母a-z		b+97-36=b+61
					b	62		字符,		44
					b	63		字符_		95
				*/
				int c=(b<=9)?(b+48):((b<=35)?(b+55):((b<=61)?(b+61):((b==62)?44:95)));
				resultStr.append((char)c);
			}
		}
		if(num>0)
		{
			int b=byte1<<(6-num);
			int c = (b<=9)?(b+48):((b<=35)?(b+55):((b<=61)?(b+61):((b==62)?44:95)));
			resultStr.append((char)c);
		}
		return resultStr.toString();
	}
	
	/*
	 * 處理API 
	 * 
	 * 進行名稱替換
	 * 在最後進行WebService的壓縮,故WebService 沒有經過改名
	 * 
	 * */
	public static void handle(String api){
		try {			
			if(api==null||api.trim().length()<1){
				return;
			}			
			sortMapsGroup();
			
			ObsNamesConfig usedNames = new ObsNamesConfig();
			StringBuilder sb = new StringBuilder();			
			sb.append("(function(){");	
			sb.append("this.info={time:'");	
			sb.append(new Date().toString());	
			sb.append("',version:'");	
			sb.append(ReadConfig.PG_CODE_VERSION);	
			sb.append("',ov:'");
			sb.append(ReadConfig.PG_OV_VERSION);	
			sb.append("'};");
			//解壓字符串函數
			String h_s_d = "ObsureFunctionDecodeString";			
			String h_s = "var "+usedNames.getName(h_s_d)+"=function(p){var a=0,s=0;var d=p.length;var f=new String();var g=-1;var h=0;for(var j=0;j<d;j++){var k=p.charCodeAt(j);k=(k==95)?63:((k==44)?62:((k>=97)?(k-61):((k>=65)?(k-55):(k-48))));s=(s<<6)+k;a+=6;while(a>=8){var l=s>>(a-8);if(h>0){g=(g<<6)+(l&(0x3f));h--;if(h==0){f+=String.fromCharCode(g);};}else{if(l>=224){g=l&(0xf);h=2;}else if(l>=128){g=l&(0x1f);h=1;}else{f+=String.fromCharCode(l);};};s=s-(l<<(a-8));a-=8;};};return f;};";
			sb.append(h_s);	
			sb.append("window.PG=window.PG||{};");//名字空間
			sb.append("var "+usedNames.getName("window.PG.")+"=window.PG;");
			sb.append("var "+usedNames.getName("window.")+"=window;");
			sb.append("var "+usedNames.getName("document.")+"=document;");
			sb.append("var "+usedNames.getName("navigator.")+"=navigator;");			
			sb.append("var "+usedNames.getName("PG.")+"=PG;");
							
								
			
			String a = api;
						    
			/*
			 * 加密系統所有匹配下面正則表達式的字符串
			 * 
			 * 正則表達式 \"(\\w)*\"
			 			"\"[^\"\\(\\)\',;+={}]*\""
			 
			 */		
			String g = "\"(\\w)*\"";
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
					//String _h = usedNames.getName(h_s_d)+"(\""+functionEncodeString(pa777)+"\")";	
					String _h = new StringBuilder().append(usedNames.getName(h_s_d)).append("(\"").
													append(functionEncodeString(pa777)).append("\")").toString();

					//System.out.println(m.start()+"   "+m.end()+"  "+pa666+"  "+_h);			
					a = new StringBuilder().append(a.substring(0, s)).append(" ").append(_h).append(a.substring(e)).toString();
					//匹配剩下的部分,不能再從0開始匹配,否則會發生死循環
					m = p.matcher(a).region(s+_h.length(), a.length());										
				}				
				b = m.find();				
			}			
			
			
			//處理系統全局對像,將window.PG window PG document navigator替換掉
			Iterator<String> it = usedNames.getONNames().keySet().iterator();
			String oldN = null;
			String newN = null;
			int count = 0;
			while(it.hasNext()){
				count = 0;
				oldN = it.next();	
				newN = usedNames.getONNames().get(oldN);
				//System.out.println("count = "+count+"  "+oldN+"  "+newN);
				int p6 = a.indexOf(oldN);
				while(p6!=-1){
					a = a.replace(oldN, newN+".");
					p6 = a.indexOf(oldN);
					count++;
					//System.out.println("count = "+count+"  "+oldN+"  "+newN);
				}				
			}
						
			//處理地圖對像--將長名稱對像替換為短名稱對像 eg:PG.OverviewMapControl--PG.I
			String sys_pg = usedNames.getName("PG.")+".";		
			String prototype = ".prototype.";
			for (int i = 0; i < ReadConfig.PG_MapsGroup_ALL.length; i++) {
				count = 0;
				String o_n1 = ReadConfig.PG_MapsGroup_ALL[i];
				oldN = sys_pg+o_n1;			
				newN = sys_pg+usedNames.getName(oldN);
				int p6 = a.indexOf(oldN);
				while(p6!=-1){					
					a = a.replace(oldN, newN);
					p6 = a.indexOf(oldN);
					count++;
					//System.out.println("count = "+count+"  "+oldN+"  "+newN);
				}	
				
				//處理對象的prototype						
				oldN = newN+prototype;
				System.out.println("**********  handle prototype  *************");				
				//正則表達式---匹配模式PG.Rect.prototype.Clone = function()以提取PG.Rect.prototype部分,進行重命名
				String reg_p = newN.replaceFirst("\\.", "\\\\.").replaceFirst(";", "") + "\\.prototype\\.(\\w)*\\s*=\\s*function\\(\\s*(\\w)*(\\s*,\\s*\\w*)*\\)";
				System.out.println(newN+ "********RegExp " + reg_p);				
				Pattern p_p = Pattern.compile(reg_p);
				Matcher p_m = p_p.matcher(a);
				boolean p_b = p_m.find();				
				String newNP = usedNames.getName(oldN)+".";		
				//第一次匹配,在第一次匹配的前面加上var name = PG.Rect.prototype;以後的PG.Rect.prototype用name替代
				if(p_b){
					
					//System.out.println(p_m.start()+"   "+p_m.end()+"   "+a.substring(p_m.start(), p_m.end()).replaceAll("\\n", ""));

					int s = p_m.start();
					int e = p_m.end();
					pa666 = a.substring(s, e).replaceAll("\\n", "");
					
					int p1 = pa666.indexOf(prototype);
					
					String a1 = new StringBuilder().append("var ").
					append(newNP.substring(0, newNP.length()-1)).
					append("=").append(oldN.substring(0, oldN.length()-1)).append(";")
					.toString();
					String a2 = pa666.substring(p1+prototype.length());
					String a3 = a.substring(e);
					
					System.out.println("********old prototype    " +  pa666);
					System.out.println("********new prototype    " +  newNP + a2);
					
					a = new StringBuilder().append(a.substring(0, s)).append(" ").append(a1).append(newNP)
							.append(a2).append(a3).toString();					
					p_m = p_p.matcher(a).region(s+a1.length()+newNP.length()+a2.length(), a.length());	
					p_b = p_m.find();
					while(p_b){		
						s = p_m.start();
						e = p_m.end();
						pa666 = a.substring(s, e).replaceAll("\\n", "");
						p1 = pa666.indexOf(prototype);
						a2 = pa666.substring(p1+prototype.length());
						
						System.out.println("********old prototype    " +  pa666);
						System.out.println("********new prototype    " +  newNP + a2);
						
						
						a = new StringBuilder().append(a.substring(0, s)).append(" ")
						.append(newNP)
						.append(a2).append(a.substring(e)).toString();
						//匹配剩下的部分,不能再從0開始匹配,否則會發生死循環
						p_m = p_p.matcher(a).region(s+newNP.length()+a2.length(), a.length());								
						p_b = p_m.find();
						//System.out.println("count = "+count+"  "+oldN+"  "+newN);
						//System.out.println(o_n1 + "****"+a2.substring(p6+oldN.length(), p6+oldN.length()+25));
					}
				}
			}
			
			
			System.out.println("**************Start to handle WebService!****************");
			
			ByteArrayOutputStream byteot = new ByteArrayOutputStream();			
			String[] args3={
			 		 "--compilation_level","SIMPLE_OPTIMIZATIONS",
			 		 "--js","test1.js",
					};
			PGOutput p9 =new PGOutput(byteot);
		    CommandLineRunner runner = new CommandLineRunner(args3, p9);
		     runner.setPGSource(MergerJSFile.handleWebServiceAPi());		     		     
		     if (runner.shouldRunCompiler()) {
		      runner.run();
		    } else {
		      System.exit(-1);
		    }	     
		    System.out.println("**************Handle WebService Over!****************");
		    
		    
			sb.append(a+p9.getData());
			sb.append("})();");
			
			
			writeF(ReadConfig.PG_SAVE_PATH,sb.toString().replaceAll("\n", "").trim());
			
			System.out.println("文件保存到路徑    "+ReadConfig.PG_SAVE_PATH);
			
			
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
				
	}
	
	/**
	 * Thomas Chen modify date:10/15/2012
	 * 輸入字符到指定路徑的文件
	 * 
	 * p : 路徑
	 * 
	 * c : 輸出內容
	 *
	 * */
	/*
	private static String writeF(String p,String c) throws Exception {		
		  File fwf = new File(p);
		  if(fwf.exists()){fwf.delete();} 
		  FileWriter fw = new FileWriter(fwf);
		  fw.write(c);
		  fw.close();		  
		 return "";
	}
	*/
	private static String writeF(String p,String c) throws Exception {		
		try {
	      FileOutputStream fos = new FileOutputStream(p);
	      java.io.Writer out = new OutputStreamWriter(fos, "UTF8");
	      out.write(c);
	      out.close();
	    } catch (IOException e) {
	      e.printStackTrace();
	    }		  
		 return "";
	}
	
	/**
	 * 讀取指定路徑的文件
	 * 
	 * p : 路徑
	 * 
	 * 
	 * */
	private static String readF(String p) throws Exception {

		StringBuilder sb = new StringBuilder();
		BufferedReader fis = new BufferedReader(new FileReader(p));
		String inputString;
		while ((inputString = fis.readLine()) != null) {
			//sb.append(new String(inputString.getBytes(), "utf-8")).append("\n");
			sb.append(new String(inputString.getBytes(), "utf-8"));
		}
		fis.close();
		return sb.toString();
	}	

}

/**
 * 名字空間
 * 
 * 用於生成更短名字的字符
 * 
 * */
class ObsNamesConfig{
	/*   old-new eg:PG-A */
	private static final char[] nameStartString="QWERTYUIOPASDFGHJKLZXCVBNM".toCharArray();		//生成的變量使用的變量名稱
	private static final char[] nameString="QWERTYUIOPASDFGHJKLZXCVBNM_qwertyuiopasdfghjklzxcvbnm0123456789".toCharArray();	//生成的變量使用的變量名稱
	private Map<String,String> namesN=new LinkedHashMap<String,String>();		//保存新變量名
	private int nameDigit=1;					//自動取變量的查找位數
	private int nameIndex=0;					//自動取變量的索引
	
	
	public ObsNamesConfig(){
	}
	
	public Map<String,String> getONNames(){		
		return namesN;
	}
	
	//根據原有的變量名成返回新的變量名稱，如果查找不到，則創建新的變量
	public String getName(String oName)
	{
		if(oName!=null)
		{
			String result=namesN.get(oName);
			if(result!=null){return result;}
		}
		String name=getNewName();
		addName(new String[]{oName,name});
		//System.out.println("*****"+namesN.get(oName));
		return name;
	}	
	
	//自動生成一個新的可以使用的變量名
	public String getNewName()
	{
		String newName;
		int index;
		while(true)
		{
			newName="";
			index=nameIndex;
			for(int i=0;i<nameDigit;i++)//根據變量名稱可使用的字符列表生成一個指定位數的變量
			{
				char[] str=(i==0)?nameStartString:nameString;
				int t=index%str.length;
				index=(index-t)/str.length;
				newName+=str[t];
			}
			if(!namesN.containsValue(newName)){break;}
			nameIndex++;

			//如果該位數的變量已經全部取完,則升位,重新取變量
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
	
	/**
		添加一個變量名

		參數name可能有兩種情況:name是一個數組,包含原來的變量名和新的變量名,例如["obj","o"]	
	*/
	public void addName(String[] name)
	{
		namesN.put(name[0], name[1]);
	}	
	
}
