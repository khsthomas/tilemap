package test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class T61 {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		// TODO Auto-generated method stub
		
		String path="E:/jsencrypt/js11/api/api8889.js";
		String path1="E:/jsencrypt/js11/api/api_google_ge9999.js";
		String cxt = readF(path);
		/*
		 * "\"(\\w)*\""
		 * 
		 * 
		 * [^abc]
		 * 
		 * */
		//String g = "\"\\.?(\\w)*(://)?(\\w)*(\\.\\w)*/?(\\w*/)?(\\.\\w)?\"";
		//String g="\"[\\.#_-]*(\\w*)\"";
		String g="\"[^\"\\(\\)\',;+={}]*\"";
		Pattern p = Pattern.compile(g);
		Matcher m = p.matcher(cxt);
		boolean b = m.find();
		//System.out.println(b);
		StringBuilder sb=new StringBuilder();
		System.out.println("*************start************************");
		int count=0;
		while(b){
			
			//System.out.println(m.start()+"   "+m.end()+"   "+cxt.substring(m.start(), m.end()));
			sb.append(m.start()).append("\t").append(m.end()).append("\t").
			append(cxt.substring(m.start(), m.end())).append("\n");
			
			//System.out.println(m.start()+"   "+m.end());
			//System.out.println(cxt.substring(m.start(), m.end()));
			//System.out.println(m.regionStart()+"   "+m.regionEnd());
			count++;
			
			b = m.find();
				
		}
		
		writeF(path1,sb.toString());
		System.out.println("*************count = " + count);
		
		System.out.println("*************over************************");
		
	}
	
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

	private static String writeF(String p,String c) throws Exception {		
		  File fwf = new File(p);
		  if(fwf.exists()){fwf.delete();} FileWriter fw = new FileWriter(fwf);
		  fw.write(c);
		  fw.close();		  
		 return "";
	}
}
