package com.google.javascript.jscomp.pg;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Locale;

import com.google.javascript.jscomp.CommandLineRunner;


/**
 * @author xujinping 
 * xjpwyclear.happy@163.com
 * 
 * Compress First.
 * 
 * 處理壓縮的入口程序
 *
 */
public class RunHandler {	
	public void handle(){
		
		try {
			System.out.println("**************Start to Handle!****************");
			
			System.out.println("**************Start to Read config info!****************");
			new ReadConfig();//初始化配置信息
			System.out.println("**************Read config info Over!****************");
			
			System.out.println("**************Start to Merger all JS files!****************");
			
			String source = MergerJSFile.handleMapsAPI();
			
			System.out.println("**************Merger all JS files Over!****************");

			
			
			System.out.println("**************Start to Compress first!****************");
			
			ByteArrayOutputStream byteot = new ByteArrayOutputStream();			
			String[] args3={
			 		 "--compilation_level","SIMPLE_OPTIMIZATIONS",
			 		 "--js","test.js",
					};
			PGOutput p =new PGOutput(byteot);
		    CommandLineRunner runner = new CommandLineRunner(args3, p);
		     runner.setPGSource(source);		     		     
		     if (runner.shouldRunCompiler()) {
		      runner.run();
		    } else {
		      System.exit(-1);
		    }	     
		    System.out.println("**************Compress first Over!****************");
		    
		    
		    System.out.println("**************Start to Compress second!****************");
		    
		    CompressPG.handle(p.getData());
		    
		    System.out.println("**************Compress second Over!****************");
	        
		     
		     System.out.println("**************Handle Over!****************");
		     
		     System.exit(0);
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub			
		new RunHandler().handle();
	}
}


/*
 * GOOGLE壓縮輸出類
 * 
 * 將GOOGLE壓縮之後的代碼通過此類打印到內存,並通過data屬性保存
 * 
 * */
class PGOutput extends PrintStream{
	/* GOOGLE壓縮之後的代碼 */
	private ByteArrayOutputStream jsOutput;	
	/* GOOGLE壓縮之後的代碼 */
	private String data;
	
	public PGOutput(ByteArrayOutputStream jsOutput){
		super(jsOutput);
		this.jsOutput = jsOutput;
	}
	public String getData(){
		return data;	
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#append(char)
	 */
	@Override
	public PrintStream append(char c) {
		// TODO Auto-generated method stub
		return super.append(c);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#append(java.lang.CharSequence, int, int)
	 */
	@Override
	public PrintStream append(CharSequence csq, int start, int end) {
		// TODO Auto-generated method stub
		return super.append(csq, start, end);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#append(java.lang.CharSequence)
	 */
	@Override
	public PrintStream append(CharSequence csq) {
		// TODO Auto-generated method stub
		return super.append(csq);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#checkError()
	 */
	@Override
	public boolean checkError() {
		// TODO Auto-generated method stub
		return super.checkError();
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#clearError()
	 */
	@Override
	protected void clearError() {
		// TODO Auto-generated method stub
		super.clearError();
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#close()
	 */
	@Override
	public void close() {
		// TODO Auto-generated method stub
		super.close();
		try {
			byte[] buf=jsOutput.toByteArray();//獲取內存緩衝中的數據
			// System.out.println(new String(buf));
			 data = new String(buf);
			jsOutput.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#flush()
	 */
	@Override
	public void flush() {
		// TODO Auto-generated method stub
		super.flush();
		try {
			jsOutput.flush();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#format(java.util.Locale, java.lang.String, java.lang.Object[])
	 */
	@Override
	public PrintStream format(Locale l, String format, Object... args) {
		// TODO Auto-generated method stub
		return super.format(l, format, args);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#format(java.lang.String, java.lang.Object[])
	 */
	@Override
	public PrintStream format(String format, Object... args) {
		// TODO Auto-generated method stub
		return super.format(format, args);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(boolean)
	 */
	@Override
	public void print(boolean b) {
		// TODO Auto-generated method stub
		super.print(b);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(char)
	 */
	@Override
	public void print(char c) {
		// TODO Auto-generated method stub
		super.print(c);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(char[])
	 */
	@Override
	public void print(char[] s) {
		// TODO Auto-generated method stub
		super.print(s);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(double)
	 */
	@Override
	public void print(double d) {
		// TODO Auto-generated method stub
		super.print(d);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(float)
	 */
	@Override
	public void print(float f) {
		// TODO Auto-generated method stub
		super.print(f);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(int)
	 */
	@Override
	public void print(int i) {
		// TODO Auto-generated method stub
		super.print(i);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(long)
	 */
	@Override
	public void print(long l) {
		// TODO Auto-generated method stub
		super.print(l);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(java.lang.Object)
	 */
	@Override
	public void print(Object obj) {
		// TODO Auto-generated method stub
		super.print(obj);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#print(java.lang.String)
	 */
	@Override
	public void print(String s) {
		// TODO Auto-generated method stub
		super.print(s);
		
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#printf(java.util.Locale, java.lang.String, java.lang.Object[])
	 */
	@Override
	public PrintStream printf(Locale l, String format, Object... args) {
		// TODO Auto-generated method stub
		return super.printf(l, format, args);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#printf(java.lang.String, java.lang.Object[])
	 */
	@Override
	public PrintStream printf(String format, Object... args) {
		// TODO Auto-generated method stub
		return super.printf(format, args);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println()
	 */
	@Override
	public void println() {
		// TODO Auto-generated method stub
		super.println();
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(boolean)
	 */
	@Override
	public void println(boolean x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(String.valueOf(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(char)
	 */
	@Override
	public void println(char x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(String.valueOf(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(char[])
	 */
	@Override
	public void println(char[] x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(String.valueOf(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(double)
	 */
	@Override
	public void println(double x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(Double.toString(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(float)
	 */
	@Override
	public void println(float x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(String.valueOf(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(int)
	 */
	@Override
	public void println(int x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(String.valueOf(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(long)
	 */
	@Override
	public void println(long x) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(Long.toBinaryString(x).getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(java.lang.Object)
	 */
	@Override
	public void println(Object x) {
		// TODO Auto-generated method stub
		super.println(x);
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#println(java.lang.String)
	 */
	@Override
	public void println(String x) {
		// TODO Auto-generated method stub
		//super.println(x);
		try {
			jsOutput.write(x.getBytes());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#setError()
	 */
	@Override
	protected void setError() {
		// TODO Auto-generated method stub
		super.setError();
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#write(byte[], int, int)
	 */
	@Override
	public void write(byte[] buf, int off, int len) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(buf, off, len);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	/* (non-Javadoc)
	 * @see java.io.PrintStream#write(int)
	 */
	@Override
	public void write(int b) {
		// TODO Auto-generated method stub
		try {
			jsOutput.write(b);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}	
}
