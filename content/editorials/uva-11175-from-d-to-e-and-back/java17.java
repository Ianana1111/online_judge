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
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int n=fs.nextInt(),k=fs.nextInt();BitSet[]row=new BitSet[n];
   for(int i=0;i<n;i++)row[i]=new BitSet(n);
   while(k-->0)row[fs.nextInt()].set(fs.nextInt());
   boolean valid=true;
   for(int u=0;u<n;u++)for(int v=u+1;v<n;v++)
    if(row[u].intersects(row[v])&&!row[u].equals(row[v]))valid=false;
   out.append("Case #").append(tc).append(": ").append(valid?"Yes":"No").append('\n');
  }
  System.out.print(out);
 }
}
