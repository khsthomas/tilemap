package test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class T63 {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		String g = "((\\\\u)(\\w*))";
		String t ="\\u57ce\\u5e02";
		Pattern p = Pattern.compile(g);
		Matcher m = p.matcher(t);
		boolean b = m.find();
		while(b){
			//System.out.println(m.start()+"   "+g.substring(m.start(), m.start()+t.length()));
			
			//System.out.println(m.start()+"   "+m.end());
			//System.out.println(t.substring(m.start(), m.end()));		
			
			for(int i=1;i<=m.groupCount();i++){
				
				System.out.println("group "+i+" = "+m.group(i));
			}

			
			b = m.find();
				
		}
		

	}

}
