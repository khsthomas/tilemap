package test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class MergerJSFile {
	/**基本路径*/
	private static String PG_BASE_PATH = "";	
	
	/**MAPS API系统CONFIG文件路径*/
	private static String PG_CONF_PATH = "";
	/**MAPS API系统CONFIG文件列表*/
	private static String PG_CONF_PATH_NAMES = "";
	
	/**MAPS API系统AJAX文件路径*/
	private static String PG_AJAX_PATH = "";
	/**MAPS API系统AJAX文件列表*/
	private static String PG_AJAX_PATH_NAMES = "";
	
	/**MAPS API系统MAPS文件路径*/
	private static String PG_MAPS_PATH = "";
	/**MAPS API系统MAPS文件列表*/
	private static String PG_MAPS_PATH_NAMES = "";	
		
	static {
		p1();
		//p2();
	}

	private static void p1() {
		try {
			InputStream is = MergerJSFile.class.getClassLoader()
					.getResourceAsStream("pathconfig.properties");

			Properties prop = new Properties();
			prop.load(is);
			
			// 获取配置文件内容			
			PG_BASE_PATH = prop.getProperty("PG_BASE_PATH");						
			
			PG_CONF_PATH_NAMES = prop.getProperty("PG_CONF_PATH_NAMES");
			PG_AJAX_PATH_NAMES = prop.getProperty("PG_AJAX_PATH_NAMES");
			PG_MAPS_PATH_NAMES = prop.getProperty("PG_MAPS_PATH_NAMES");
			
			PG_CONF_PATH = prop.getProperty("PG_CONF_PATH");
			PG_AJAX_PATH = prop.getProperty("PG_AJAX_PATH");
			PG_MAPS_PATH = prop.getProperty("PG_MAPS_PATH");

		} catch (IOException e) {

			throw new ExceptionInInitializerError(e);
		}
	}

	@SuppressWarnings("unused")
	private static void p2() {
		try {
			String dir = System.getProperty("user.dir");
			File file = new File(dir + "\\pathconfig.properties");
			System.out.println("user.dir = " + dir);
			System.out.println("file.getAbsolutePath = "
					+ file.getAbsolutePath());
			if (file.exists()) {
				InputStream is = new FileInputStream(file);
				Properties prop = new Properties();
				prop.load(is);
				// 获取配置文件内容
				PG_BASE_PATH = prop.getProperty("PG_BASE_PATH");
				PG_BASE_PATH = prop.getProperty("PG_BASE_PATH");						
				
				PG_CONF_PATH_NAMES = prop.getProperty("PG_CONF_PATH_NAMES");
				PG_AJAX_PATH_NAMES = prop.getProperty("PG_AJAX_PATH_NAMES");
				PG_MAPS_PATH_NAMES = prop.getProperty("PG_MAPS_PATH_NAMES");
				
				PG_CONF_PATH = prop.getProperty("PG_CONF_PATH");
				PG_AJAX_PATH = prop.getProperty("PG_AJAX_PATH");
				PG_MAPS_PATH = prop.getProperty("PG_MAPS_PATH");
				

			} else {
				System.out.println(file.getAbsolutePath() + "不存在");
			}

		} catch (IOException e) {

			throw new ExceptionInInitializerError(e);
		}
	}

	private static String mergerFile(String path, String[] fileNames) {
		try {				
			File file = null;
			FileReader fr = null;
			BufferedReader s = null;
			StringBuilder sb = new StringBuilder();
			String _path = PG_BASE_PATH + path;
			if(fileNames.length==1&&"".equals(fileNames[0].trim())){
				System.out.println("文件路径  " + _path + "没有处理的文件.");
				return "";
			}
			System.out.println("文件路径  " + _path);			
			for (int i = 0; i < fileNames.length; i++) {
				file = new File(_path + fileNames[i]);
				System.out.println("正在处理的文件是  " + file.getName());
				fr = new FileReader(file);
				s = new BufferedReader(fr);
				String a = s.readLine();
				/*
				 if(a!=null){
					a = new String(a.getBytes("iso-8859-1"),"gb2312");
				}
				while (a != null) {
					// System.out.println(a);
					sb.append(a + "\n");
					a = s.readLine();
					if(a!=null){
						a = new String(a.getBytes("iso-8859-1"),"gb2312");
					}
				}
				*/
				while (a != null) {
					// System.out.println(a);
					sb.append(a + "\n");
					a = s.readLine();					
				}
				s.close();
				fr.close();
			}
						
			return sb.toString();

		} catch (IOException e) {
			e.printStackTrace();
		}
		return "";

	}
	
	private static String handleConf() {
		System.out.println("\n配置文件....");		

		return mergerFile(PG_CONF_PATH, PG_CONF_PATH_NAMES.split(","));
	}

	private static String handleAJAX() {
		System.out.println("\nAJAX文件....");
		return mergerFile(PG_AJAX_PATH, PG_AJAX_PATH_NAMES.split(","));
	}

	private static String handleMaps() {
		System.out.println("\nAPI文件....");
		return mergerFile(PG_MAPS_PATH, PG_MAPS_PATH_NAMES.split(","));
	}
	
	private static String handleMapsAPI() {		
		String conf = handleConf();
		String ajax = handleAJAX();
		String maps = handleMaps();		
		
		System.out.println("正在合并....  ");				
		return new StringBuilder()
		.append(conf).append("\n")
		.append(ajax).append("\n")
		.append(maps).append("\n").toString();
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		System.out.println(handleMapsAPI());
		
	}

}
