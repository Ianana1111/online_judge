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
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n,scenario=0;
  while((n=fs.nextInt())>0){
   int[]x=new int[n],y=new int[n];long[]best=new long[n];boolean[]used=new boolean[n];
   Arrays.fill(best,Long.MAX_VALUE);
   for(int i=0;i<n;i++){x[i]=fs.nextInt();y[i]=fs.nextInt();}
   best[0]=0;
   for(int step=0;step<n;step++){
    int u=-1;
    for(int i=0;i<n;i++)if(!used[i]&&(u<0||best[i]<best[u]))u=i;
    used[u]=true;if(u==1)break;
    for(int v=0;v<n;v++)if(!used[v]){
     long dx=x[u]-x[v],dy=y[u]-y[v];
     best[v]=Math.min(best[v],Math.max(best[u],dx*dx+dy*dy));
    }
   }
   out.append("Scenario #").append(++scenario).append('\n')
    .append(String.format(Locale.US,"Frog Distance = %.3f%n%n",Math.sqrt(best[1])));
  }
  System.out.print(out);
 }
}
