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

public class T4 {
	/*
	 
	 E:/JAVA_WorkSpace/se_javascriptapi3_taiwan/SRC/
	 
	 E:/jsencrypt/js11/
	 
	 */
	private static final String API_PATH = "E:/jsencrypt/js11/";
	private static final String CFG_PATH = "E:/jsencrypt/js11/";

	private static String[][] ajax_files = { { "PG.Geo.js", "NSGeo" },
			{ "PG.Point.js", "NSPoint" }, { "PG.Polygon.js", "NSPolygon" },
			{ "PG.Polyline.js", "NSPolyline" },
			{ "PG.PolygonSet.js", "NSPolygonSet" }, { "PG.Rect.js", "NSRect" },
			{ "PG.Size.js", "NSSize" },
			{ "PG.BrowserInfo.js", "NSBrowserInfo" },
			{ "PG.Ajax.js", "NSAjax" }, { "PG.Event.js", "NSEvent" },
			{ "PG.ObjectLoader.js", "NSObjectLoader" },
			{ "PG.Tool.js", "NSTool" } 
			};
	
	private static String[][] maps_files = {};

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ScriptEngineManager mgr = new ScriptEngineManager();
		ScriptEngine engine = mgr.getEngineByExtension("js");
		try {
			T4.testInvokeScriptMethod(engine);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * 演示如何在Java中调用脚本语言的方法，通过JDK平台给script的方法中的形参赋值
	 * 
	 * @param engine
	 *            ScriptEngine实例
	 * @return void
	 */
	private static void testInvokeScriptMethod(ScriptEngine engine)
			throws Exception {

		initObsure(engine);
		initConfig(engine);
		//initAJAX(engine);
	}

	private static String initObsure(ScriptEngine engine) throws Exception {
		System.out.println("*****************start init obsure**********************");
		String config = "obsure_global.js";
		engine.eval(readF(CFG_PATH + config));
		//Invocable inv = (Invocable) engine;
		//inv.invokeFunction("ObscureJSNS");
		System.out.println("*****************end init obsure**********************");
		return "";

	}

	private static String initConfig(ScriptEngine engine) throws Exception {
		System.out
				.println("*****************start init config**********************");
		String name = "maps_config.js";
		engine.eval(readF(CFG_PATH+name));
		Invocable inv = (Invocable) engine;
		inv.invokeFunction("NS_CONFEXE");
		String cfg = (String) inv.invokeFunction("SaveConfig");
		writeF(CFG_PATH+"api/maps_config.js",cfg);
		System.out.println("config:" + cfg);
		System.out
		.println("*****************end init config**********************");
		return "";

	}

	private static String initAJAX(ScriptEngine engine) throws Exception {
		System.out
		.println("*****************start init ajax**********************");
		String path = API_PATH + "BASE/ajax/";
		Invocable inv = (Invocable) engine;
		for (int i = 0; i < ajax_files.length; i++) {

			engine.eval(readF(path + ajax_files[i][0]));
			inv.invokeFunction(ajax_files[i][1]);
		}
		String ajax = (String) inv.invokeFunction("SaveAJAX");
		writeF(CFG_PATH+"api/maps_ajax.js",ajax);
		System.out.println("ajax:" + ajax);
		
		System.out
		.println("*****************end init ajax**********************");
		return "";

	}
	
	private static String initMap(ScriptEngine engine) throws Exception {
		System.out
		.println("*****************start init ajax**********************");
		String path = API_PATH + "BASE/mapsapi/";
		Invocable inv = (Invocable) engine;
		for (int i = 0; i < maps_files.length; i++) {

			engine.eval(readF(path + ajax_files[i][0]));
			inv.invokeFunction(ajax_files[i][1]);
		}
		String map = (String) inv.invokeFunction("SaveMap");
		System.out.println("map:" + map);
		
		System.out
		.println("*****************end init ajax**********************");
		return "";

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
