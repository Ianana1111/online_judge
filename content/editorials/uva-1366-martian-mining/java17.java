import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>0){
   int m=fs.nextInt();long[][]west=new long[n+1][m+1],north=new long[n+1][m+1];
   for(int i=1;i<=n;i++)for(int j=1;j<=m;j++)west[i][j]=fs.nextInt()+west[i][j-1];
   for(int i=1;i<=n;i++)for(int j=1;j<=m;j++)north[i][j]=fs.nextInt()+north[i-1][j];
   long[]dp=new long[m+1];
   for(int i=1;i<=n;i++)for(int j=1;j<=m;j++)
    dp[j]=Math.max(dp[j]+west[i][j],dp[j-1]+north[i][j]);
   out.append(dp[m]).append('\n');
  }
  System.out.print(out);
 }
}
