import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();ArrayList<Integer>queries=new ArrayList<>();int n,largest=0;
  while((n=fs.nextInt())>=0){queries.add(n);largest=Math.max(largest,n/2);}
  final long mod=1000000007L;long[]factorial=new long[largest+2];factorial[0]=1;
  for(int i=1;i<=largest+1;i++)factorial[i]=factorial[i-1]*i%mod;
  StringBuilder out=new StringBuilder();
  for(int value:queries){long f=factorial[value/2],answer=f*f%mod;
   if(value%2!=0)answer=answer*value%mod;out.append(answer).append('\n');}
  System.out.print(out);
 }
}
