package test;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class T2 {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ScriptEngineManager mgr = new ScriptEngineManager();    
		ScriptEngine engine = mgr.getEngineByExtension("js");  
		try {
			T2.testInvokeScriptMethod(engine);			
			
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
	   
		/*StringBuilder sb=new StringBuilder();
		BufferedReader fis = new BufferedReader(new FileReader("E:/jsencrypt/js10/maps_config2.js"));
		// DataOutputStream fos = new DataOutputStream( new
		// FileOutputStream("output.txt"));
		String inputString;
		while ((inputString = fis.readLine()) != null) {
			sb.append(new String(inputString.getBytes(),"utf-8")).append("\n");    
		}    	    
	   
	    //new FileReader(reader);
	   // System.out.println(sb.toString());  
	    
		fis.close();*/	
	    
	    System.out.println("****************************************"); 
	    FileReader fr = new FileReader("E:/jsencrypt/js10/maps_config2.js");
	    
	    engine.eval(fr);
	    
	    
	    Invocable inv = (Invocable) engine;  
	    String res = (String) inv.invokeFunction("SaveConfig");  
	    System.out.println("res:" + res); 
	    
	    System.out.println(engine.get("i.__UID__"));  
	    System.out.println(engine.getContext().getAttribute("window.__UID__")); 
	     
	    
	    
	    fr.close();
	    
	    
	}  	
}
