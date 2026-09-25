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
  final long mod=1000000007L;
  for(int tc=1;tc<=tests;tc++){
   int count=(int)fs.nextLong();long ordered=1,number=1;
   while(count-->0){
    long prime=fs.nextLong();int exponent=(int)fs.nextLong();long power=1,lower=0;
    for(int i=0;i<exponent;i++){lower=(lower+power)%mod;power=power*prime%mod;}
    long factor=(lower+(exponent+1)*power)%mod;
    ordered=ordered*factor%mod;number=number*power%mod;
   }
   out.append("Case ").append(tc).append(": ").append((ordered+number)%mod).append('\n');
  }
  System.out.print(out);
 }
}
