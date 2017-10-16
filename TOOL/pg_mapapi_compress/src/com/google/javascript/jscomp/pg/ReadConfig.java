package com.google.javascript.jscomp.pg;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;



/**
 * @author xujinping
 *  xjpwyclear.happy@163.com
 *
 *	READ CONFIG INFO
 *
 */
public class ReadConfig {
	/**基本路徑*/
	public static String PG_BASE_PATH = "";	
	
	/**MAPS API系統CONFIG文件路徑*/
	public static String PG_CONF_PATH = "";
	/**MAPS API系統CONFIG文件列表*/
	public static String PG_CONF_PATH_NAMES = "";
	
	/**MAPS API系統AJAX文件路徑*/
	public static String PG_AJAX_PATH = "";
	/**MAPS API系統AJAX文件列表*/
	public static String PG_AJAX_PATH_NAMES = "";
	
	/**MAPS API系統MAPS文件路徑*/
	public static String PG_MAPS_PATH = "";
	/**MAPS API系統MAPS文件列表*/
	public static String PG_MAPS_PATH_NAMES = "";
	
	/**MAPS API保存路徑*/
	public static String PG_SAVE_PATH = "";
	
	/**MAPS API版本*/
	public static String PG_CODE_VERSION = "";
	
	/**MAPS API混淆器版本*/
	public static String PG_OV_VERSION = "";
	
	/**MAPS API	AJAX文件的所有對象名稱*/
	public static String PG_AJAXGroup="";
	
	/**MAPS API MAPS文件的所有對象名稱*/
	public static String PG_MapsGroup="";
	
	/**MAPS API MAPS文件的所有對象名稱*/
	public static String[] PG_MapsGroup_ALL=null;
	
	/**MAPS API WEB_SERVICE文件名稱*/
	public static String PG_WEB_SERVICE_PATH_NAMES="";
	
		
	static {
		//readConfigFromClassPath();
		readConfigFromFileSYPath();
	}
	
	/*
	 * 讀取class目錄下的配置文件
	 * 
	 * */
	private static void readConfigFromClassPath() {
		try {
			//取jar 同目錄下的pathconfig.properties
			InputStream is = MergerJSFile.class.getClassLoader()
					.getResourceAsStream("pathconfig.properties");

			Properties prop = new Properties();
			prop.load(is);
			
			// 獲取配置文件內容			
			PG_BASE_PATH = prop.getProperty("PG_BASE_PATH");						
			
			PG_CONF_PATH_NAMES = prop.getProperty("PG_CONF_PATH_NAMES");
			PG_AJAX_PATH_NAMES = prop.getProperty("PG_AJAX_PATH_NAMES");
			PG_MAPS_PATH_NAMES = prop.getProperty("PG_MAPS_PATH_NAMES");
			
			PG_CONF_PATH = prop.getProperty("PG_CONF_PATH");
			PG_AJAX_PATH = prop.getProperty("PG_AJAX_PATH");
			PG_MAPS_PATH = prop.getProperty("PG_MAPS_PATH");
			PG_SAVE_PATH = prop.getProperty("PG_SAVE_PATH");
			
			PG_CODE_VERSION = prop.getProperty("PG_CODE_VERSION");			
			PG_OV_VERSION = prop.getProperty("PG_OV_VERSION");
			PG_AJAXGroup = prop.getProperty("PG_AJAXGroup");			
			PG_MapsGroup = prop.getProperty("PG_MapsGroup");
			PG_MapsGroup_ALL = (PG_AJAXGroup + "," + PG_MapsGroup).split(",");
			
			System.out.println("Map API Objects needed to handle is:");
			System.out.println("PG_AJAXGroup : "+PG_AJAXGroup);
			System.out.println("PG_MapsGroup : "+PG_MapsGroup);
			
			PG_WEB_SERVICE_PATH_NAMES = prop.getProperty("PG_WEB_SERVICE_PATH_NAMES");
			

		} catch (IOException e) {

			throw new ExceptionInInitializerError(e);
		}
	}
	
	/*
	 * 讀取文件系統中的配置文件
	 * 
	 * */
	private static void readConfigFromFileSYPath() {
		try {
			//user.dir 	用戶的當前工作目錄
			String dir = System.getProperty("user.dir");
			File file = new File(dir + "\\pathconfig.properties");
			System.out.println("user.dir = " + dir);
			System.out.println("file.getAbsolutePath = "
					+ file.getAbsolutePath());
			if (file.exists()) {
				InputStream is = new FileInputStream(file);
				Properties prop = new Properties();
				prop.load(is);
				// 獲取配置文件內容
				PG_BASE_PATH = prop.getProperty("PG_BASE_PATH");
				PG_BASE_PATH = prop.getProperty("PG_BASE_PATH");						
				
				PG_CONF_PATH_NAMES = prop.getProperty("PG_CONF_PATH_NAMES");
				PG_AJAX_PATH_NAMES = prop.getProperty("PG_AJAX_PATH_NAMES");
				PG_MAPS_PATH_NAMES = prop.getProperty("PG_MAPS_PATH_NAMES");
				
				PG_CONF_PATH = prop.getProperty("PG_CONF_PATH");
				PG_AJAX_PATH = prop.getProperty("PG_AJAX_PATH");
				PG_MAPS_PATH = prop.getProperty("PG_MAPS_PATH");
				PG_SAVE_PATH = prop.getProperty("PG_SAVE_PATH");
				
				PG_CODE_VERSION = prop.getProperty("PG_CODE_VERSION");			
				PG_OV_VERSION = prop.getProperty("PG_OV_VERSION");
				PG_AJAXGroup = prop.getProperty("PG_AJAXGroup");			
				PG_MapsGroup = prop.getProperty("PG_MapsGroup");
				PG_MapsGroup_ALL = (PG_AJAXGroup + "," + PG_MapsGroup).split(",");
				
				System.out.println("Map API Objects needed to handle is:");
				System.out.println("PG_AJAXGroup : "+PG_AJAXGroup);
				System.out.println("PG_MapsGroup : "+PG_MapsGroup);
				
				PG_WEB_SERVICE_PATH_NAMES = prop.getProperty("PG_WEB_SERVICE_PATH_NAMES");
				

			} else {
				System.out.println(file.getAbsolutePath() + "不存在");
			}

		} catch (IOException e) {

			throw new ExceptionInInitializerError(e);
		}
	}
		

}
