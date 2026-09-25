import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n,tc=0;
  while((n=(int)fs.nextLong())>=0){
   int roads=(int)fs.nextLong();if(n==0&&roads==0)break;long[][]capacity=new long[n+1][n+1];
   for(int i=1;i<=n;i++)capacity[i][i]=Long.MAX_VALUE;
   while(roads-->0){int a=(int)fs.nextLong(),b=(int)fs.nextLong();long seats=fs.nextLong();
    capacity[a][b]=capacity[b][a]=Math.max(capacity[a][b],seats);}
   int start=(int)fs.nextLong(),target=(int)fs.nextLong();long tourists=fs.nextLong();
   for(int via=1;via<=n;via++)for(int a=1;a<=n;a++)for(int b=1;b<=n;b++)
    capacity[a][b]=Math.max(capacity[a][b],Math.min(capacity[a][via],capacity[via][b]));
   long trips=0;
   if(start!=target){long usable=capacity[start][target]-1;trips=tourists/usable+(tourists%usable!=0?1:0);}
   out.append("Scenario #").append(++tc).append("\nMinimum Number of Trips = ").append(trips).append("\n\n");
  }
  System.out.print(out);
 }
}
