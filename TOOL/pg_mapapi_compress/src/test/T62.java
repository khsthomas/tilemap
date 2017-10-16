package test;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class T62 {

	/**
	 * @param args
	 * @throws Exception 
	 */
	public static void main(String[] args) throws Exception {
		// TODO Auto-generated method stub
		
		
		String a = "T.P$666";
		System.out.println(a.replaceAll("\\.", "\\\\.").replaceFirst("\\$", "3"));
		
		System.exit(0);
		
		
		String path="E:/jsencrypt/js11/api/api_google_ge.js";
		String cxt = readF(path);
		String g = "\\.prototype\\.(\\w)*\\s*=\\s*function\\(\\s*(\\w)*(\\s*,\\s*\\w*)*\\)";
		Pattern p = Pattern.compile(g);
		Matcher m = p.matcher(cxt);
		boolean b = m.find();
		//System.out.println(b);
		while(b){
			//System.out.println(m.start()+"   "+m.end()+"   "+cxt.substring(m.start(), m.end()));
			
			//System.out.println(m.start()+"   "+m.end());
			//System.out.println(cxt.substring(m.start(), m.end()));
			//System.out.println(m.regionStart()+"   "+m.regionEnd());
			
			//b = m.find();
				
		}
		
		
		
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

}
