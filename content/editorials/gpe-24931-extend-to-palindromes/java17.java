import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;
   StringBuilder s=new StringBuilder();while(c>32&&c>=0){s.append((char)c);c=read();}return s.toString();}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();String text;
  while((text=fs.next())!=null){
   String joined=new StringBuilder(text).reverse().toString()+'#'+text;
   int[] prefix=new int[joined.length()];
   for(int i=1;i<joined.length();i++){
    int length=prefix[i-1];
    while(length>0&&joined.charAt(i)!=joined.charAt(length))length=prefix[length-1];
    if(joined.charAt(i)==joined.charAt(length))length++;
    prefix[i]=length;
   }
   int suffix=prefix[joined.length()-1];out.append(text);
   for(int i=text.length()-suffix-1;i>=0;i--)out.append(text.charAt(i));
   out.append('\n');
  }
  System.out.print(out);
 }
}
