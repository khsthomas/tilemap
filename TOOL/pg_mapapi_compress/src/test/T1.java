package test;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class T1 {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ScriptEngineManager mgr = new ScriptEngineManager();    
		ScriptEngine engine = mgr.getEngineByExtension("js");  
		try {
			T1.testInvokeScriptMethod(engine);
			//T1.testInvokeScriptMethod1(engine);
			
			
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
	    String script = "var t=999;var window = function(){};window.s=88;function helloFunction(name,p) {this.a='inner'; return this.a + '  Hello everybody,' + name+'   '+p;}";  
	    engine.eval(script);  
	  //  engine.get("t");
	    Invocable inv = (Invocable) engine;  
	    String res = (String) inv.invokeFunction("helloFunction", "Scripting","999999");  
	    System.out.println("res:" + res);  
	    System.out.println("var t = " + engine.get("t"));  
	    System.out.println("window.s = " + engine.get("window.s"));  
	}  
	
	
	/** 
	 * 演示如何在Java中调用脚本语言的方法，通过JDK平台给script的方法中的形参赋值 
	 * 
	 * @param engine ScriptEngine实例 
	 * @return void 
	 * */         
	private static void testInvokeScriptMethod1(ScriptEngine engine) throws Exception {  
	    String script = "function aaa(){function helloFunction(name,p) { return 'Hello everybody,' + name+'   '+p;};return helloFunction('8888','1111')}";  
	    engine.eval(script);  
	    Invocable inv = (Invocable) engine;  
	    String res = (String) inv.invokeFunction("aaa");  
	    System.out.println("res:" + res);  
	}  

}
