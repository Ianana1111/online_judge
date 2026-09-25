import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();long n;
  while((n=fs.nextLong())>0){
   long answer=0;
   for(long left=1;left<=n;){
    long quotient=n/left,right=n/quotient;
    long sum=(left+right)*(right-left+1)/2;
    answer+=sum*quotient;left=right+1;
   }
   out.append(answer-1).append('\n');
  }
  System.out.print(out);
 }
}
