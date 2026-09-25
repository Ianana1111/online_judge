import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  final int mod=1000007;int[][]choose=new int[401][401];choose[0][0]=1;
  for(int n=1;n<=400;n++){
   choose[n][0]=choose[n][n]=1;
   for(int k=1;k<n;k++)choose[n][k]=(choose[n-1][k-1]+choose[n-1][k])%mod;
  }
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int rows=fs.nextInt(),cols=fs.nextInt(),k=fs.nextInt();long answer=0;
   for(int mask=0;mask<16;mask++){
    int r=rows-((mask&1)!=0?1:0)-((mask&2)!=0?1:0);
    int c=cols-((mask&4)!=0?1:0)-((mask&8)!=0?1:0);
    int cells=r*c,ways=k>cells?0:choose[cells][k];
    answer+=Integer.bitCount(mask)%2==0?ways:-ways;
   }
   out.append("Case ").append(tc).append(": ").append((answer%mod+mod)%mod).append('\n');
  }
  System.out.print(out);
 }
}
