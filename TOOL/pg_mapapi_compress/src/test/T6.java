package test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class T6 {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		String g = "\"(\\w)*\"";
		String t ="\"6666\"33333\"88888\"";
		Pattern p = Pattern.compile(g);
		Matcher m = p.matcher(t);
		boolean b = m.find();
		System.out.println(b);
		while(b){
			//System.out.println(m.start()+"   "+g.substring(m.start(), m.start()+t.length()));
			
			System.out.println(m.start()+"   "+m.end());
			System.out.println(t.substring(m.start(), m.end()));
			//System.out.println(m.regionStart()+"   "+m.regionEnd());
			
			String p1 = t.substring(0, m.start());
			String p2 = t.substring(m.end());
			System.out.println(p1+" *****  "+p2);
			
			
			
			System.out.println(m.toString());
			b = m.find();
				
		}
		System.out.println(t);
		t = t.replace("333", "88888");
		
		System.out.println(t);
		
		
		Object pppp="9999";
		
		System.out.println(pppp.toString()+ "   "+pppp.toString().length());

	}

}
