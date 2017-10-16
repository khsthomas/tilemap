package com.google.javascript.jscomp.pg;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.FileInputStream;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;


/**
 * @author xujinping
 * 
 * Merger JS FILES
 *
 *
 */
public class MergerJSFile {
	
	/**
	 * Thomas Chen modify date:10/15/2012
	 * 合併文件
	 * 
	 * path      : 路徑
	 * fileNames : 合併的文件名數組 
	 * 
	 **/
	private static String mergerFile(String path, String[] fileNames) {
		try {				
			//File file = null;
			//FileReader fr = null;
			BufferedReader s = null;
			StringBuilder sb = new StringBuilder();
			String _path = ReadConfig.PG_BASE_PATH + path;
			if(fileNames.length==1&&"".equals(fileNames[0].trim())){
				System.out.println("文件路徑  " + _path + "沒有處理的文件.");
				return "";
			}
			System.out.println("文件路徑  " + _path);			
			for (int i = 0; i < fileNames.length; i++) {
				/*
				file = new File(_path + fileNames[i]);
				System.out.println("正在處理的文件是  " + file.getName());
				fr = new FileReader(file);
				s = new BufferedReader(fr);
				String a = s.readLine();
				*/
				s= new BufferedReader(new InputStreamReader(new FileInputStream(_path + fileNames[i]),"UTF-8"));
				String a = s.readLine();
				while (a != null) {
					// System.out.println(a);				
					if(a.trim().startsWith("//")){
						System.out.println("刪除註釋 :  "+a);
					}else{
						sb.append(a + "\n");						
					}

					a = s.readLine();					
				}
				s.close();
				//fr.close();
			}
						
			return sb.toString();

		} catch (IOException e) {
			e.printStackTrace();
		}
		return "";

	}
	
	private static String handleConf() {
		System.out.println("\n配置文件....");		

		return mergerFile(ReadConfig.PG_CONF_PATH, ReadConfig.PG_CONF_PATH_NAMES.split(","));
	}

	private static String handleAJAX() {
		System.out.println("\nAJAX文件....");
		return mergerFile(ReadConfig.PG_AJAX_PATH, ReadConfig.PG_AJAX_PATH_NAMES.split(","));
	}

	private static String handleMaps() {
		System.out.println("\nAPI文件....");
		return mergerFile(ReadConfig.PG_MAPS_PATH, ReadConfig.PG_MAPS_PATH_NAMES.split(","));
	}
	
	private static String handleWebService() {
		System.out.println("\nWebService文件....");
		return mergerFile(ReadConfig.PG_MAPS_PATH, new String[]{ReadConfig.PG_WEB_SERVICE_PATH_NAMES});
	}
	
	public static String handleMapsAPI() {		
		String conf = handleConf();
		String ajax = handleAJAX();
		String maps = handleMaps();		
		
		System.out.println("正在合併....  ");				
		return new StringBuilder()
		.append(conf).append("\n")
		.append(ajax).append("\n")
		.append(maps).append("\n").toString();
	}
	
	public static String handleWebServiceAPi() {	
		return handleWebService();
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		System.out.println(handleMapsAPI());
		
	}

}
