import java.io.*;
public class Main{
 static long[]power3=new long[31];
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static long prefix(int k,long rows){
  if(rows==0)return 0;
  if(k==0)return 1;
  long half=1L<<(k-1);
  if(rows<=half)return 2*prefix(k-1,rows);
  return 2*power3[k-1]+prefix(k-1,rows-half);
 }
 public static void main(String[]args)throws Exception{
  power3[0]=1;for(int i=1;i<=30;i++)power3[i]=power3[i-1]*3;
  Scanner fs=new Scanner();int tests=(int)fs.nextLong();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int k=(int)fs.nextLong();long a=fs.nextLong(),b=fs.nextLong();
   out.append("Case ").append(tc).append(": ").append(prefix(k,b)-prefix(k,a-1)).append('\n');
  }
  System.out.print(out);
 }
}
