import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=(int)fs.nextLong();StringBuilder out=new StringBuilder();
  for(int tc=0;tc<tests;tc++){
   long n=fs.nextLong(),m=fs.nextLong();
   if(tc>0)out.append('\n');
   out.append(((n-m)&((m-1)/2))==0?1:0).append('\n');
  }
  System.out.print(out);
 }
}
