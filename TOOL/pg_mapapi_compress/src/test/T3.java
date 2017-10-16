package test;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class T3 {
	
	private static String[][] ajax_files = {{"SE.BrowserInfo.js","NSBrowserInfo"},
											{"SE.Tool.js","MapNSTool"},
											{"SE.Ajax.js","NSAjax"},
											{"SE.Event.js","MapNSEvent"},
											{"SE.LngLat.js","NSIPoint"},
											{"SE.LngLatBounds.js","NSIBounds"},
											{"SE.Point.js","NSPoint"},
											{"SE.Size.js","NSSize"},
											{"SE.Size.js","NSSize"}	
											};
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ScriptEngineManager mgr = new ScriptEngineManager();    
		ScriptEngine engine = mgr.getEngineByExtension("js");  
		try {
			T3.testInvokeScriptMethod(engine);
			
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/** 
	 * 演示如何在Java中调用脚本语言的方法，通过JDK平台给script的方法中的形参赋值 
	 * 
	 * @param engine ScriptEngine实例 
	 * @return void 
	 * */         
	private static void testInvokeScriptMethod(ScriptEngine engine) throws Exception {  
	   	    
	    System.out.println("****************************************"); 
	    String path = "E:/jsencrypt/js10/";	   
	    /*
	    	maps_config2.js
	    	api_google.js
	    */
	    String config = "obsure_global.js";
	    String name = "maps_config.js";
	    
	    StringBuilder sb=new StringBuilder();		
		
	    sb.append(readF(path+config));
	    sb.append(readF(path+name));	
	   
		 System.out.println("****************all*************************"); 
		 
	   // System.out.println(sb.toString()); 
		 
		 
	    
	    engine.eval(sb.toString());	    
	    
	    Invocable inv = (Invocable) engine;  
	    String cfg = (String) inv.invokeFunction("SaveConfig");  
	    System.out.println("config:" + cfg); 
	       
	    init(engine);
	    
	    String ajax = (String) inv.invokeFunction("SaveAJAX");  
	    System.out.println("ajax:" + ajax); 
	    
	 //   String map = (String) inv.invokeFunction("SaveMap");  
	 //   System.out.println("map:" + map); 
	    
	    /*File fwf = new File(path+"all999.js");
	    if(fwf.exists()){fwf.delete();}
	    FileWriter fw = new FileWriter(fwf);
	    fw.write(cfg);
	    fw.write(ajax);
	    fw.write(map);
	    fw.close();*/
	}  
	
	
	private static String readF(String p) throws Exception {  
   	    
	    StringBuilder sb=new StringBuilder();
		BufferedReader fis = new BufferedReader(new FileReader(p));
		String inputString;
		while ((inputString = fis.readLine()) != null) {
			sb.append(new String(inputString.getBytes(),"utf-8")).append("\n");    
		}    	    
		System.out.println("********************"+p+"********************"); 
	    System.out.println(sb.toString());  
	    
		fis.close();   
		
		return sb.toString();
	    
	}
	
	private static String init(ScriptEngine engine) throws Exception {  
		String path = "E:/JAVA_WorkSpace/se_javascriptapi3_mobile/SRC/BASE/ajax/";	//E\:\\JAVA_WorkSpace\\se_javascriptapi3_mobile\\SRC\\
		Invocable inv = (Invocable) engine; 
		for(int i=0;i<ajax_files.length;i++){
			
			engine.eval(readF(path+ajax_files[i][0]));	
			inv.invokeFunction(ajax_files[i][1]);
		}
		
		return "";
	    
	}
		
	
	
	
}
