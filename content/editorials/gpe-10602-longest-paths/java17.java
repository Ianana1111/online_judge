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
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n,tc=0;
  while((n=fs.nextInt())>0){
   int start=fs.nextInt();ArrayList<Integer>[]edges=new ArrayList[n+1];
   int[]degree=new int[n+1],distance=new int[n+1];
   Arrays.fill(distance,-1000000);
   for(int i=1;i<=n;i++)edges[i]=new ArrayList<>();
   while(true){int a=fs.nextInt(),b=fs.nextInt();if(a==0&&b==0)break;edges[a].add(b);degree[b]++;}
   ArrayDeque<Integer>ready=new ArrayDeque<>();
   for(int i=1;i<=n;i++)if(degree[i]==0)ready.add(i);
   distance[start]=0;
   while(!ready.isEmpty()){
    int u=ready.removeFirst();
    for(int v:edges[u]){
     distance[v]=Math.max(distance[v],distance[u]+1);
     if(--degree[v]==0)ready.add(v);
    }
   }
   int finish=start;
   for(int i=1;i<=n;i++)if(distance[i]>distance[finish]||(distance[i]==distance[finish]&&i<finish))finish=i;
   out.append("Case ").append(++tc).append(": The longest path from ").append(start)
    .append(" has length ").append(distance[finish]).append(", finishing at ").append(finish).append(".\n\n");
  }
  System.out.print(out);
 }
}
