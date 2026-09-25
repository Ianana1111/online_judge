import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt(),limit=1;int[]queries=new int[tests];
  for(int i=0;i<tests;i++){queries[i]=fs.nextInt();limit=Math.max(limit,queries[i]);}
  int[]divisors=new int[limit+1],best=new int[limit+1];
  for(int divisor=1;divisor<=limit;divisor++)
   for(int multiple=divisor;multiple<=limit;multiple+=divisor)divisors[multiple]++;
  int record=1;
  for(int n=1;n<=limit;n++){
   if(divisors[n]>=divisors[record])record=n;
   best[n]=record;
  }
  StringBuilder out=new StringBuilder();for(int n:queries)out.append(best[n]).append('\n');
  System.out.print(out);
 }
}
