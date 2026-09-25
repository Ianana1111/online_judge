import java.io.BufferedReader;
import java.io.InputStreamReader;
public class Main {
 static final int INF=100000000;
 static String nonempty(BufferedReader input)throws Exception{String line;do{line=input.readLine();}while(line!=null&&line.trim().isEmpty());return line;}
 static int[][] readGraph(BufferedReader input,int n)throws Exception{
  int[][] graph=new int[n][n];for(int u=0;u<n;u++)for(int v=0;v<n;v++)graph[u][v]=u==v?0:INF;
  for(int row=0;row<n;row++){
   String[] parts=nonempty(input).trim().split("\\s+");int u=Integer.parseInt(parts[0])-1;
   for(int i=1;i<parts.length;i++)graph[u][Integer.parseInt(parts[i])-1]=1;
  }
  for(int k=0;k<n;k++)for(int u=0;u<n;u++)for(int v=0;v<n;v++){
   int route=graph[u][k]+graph[k][v];if(route<graph[u][v])graph[u][v]=route;
  }
  return graph;
 }
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));StringBuilder out=new StringBuilder();String line;
  while((line=nonempty(input))!=null){int n=Integer.parseInt(line.trim());if(n==0)break;
   int[][] old=readGraph(input,n),proposal=readGraph(input,n);
   String[] params=nonempty(input).trim().split("\\s+");int a=Integer.parseInt(params[0]),b=Integer.parseInt(params[1]);
   boolean valid=true;int diameter=0;
   for(int u=0;u<n;u++)for(int v=0;v<n;v++){
    diameter=Math.max(diameter,old[u][v]);
    if(proposal[u][v]==INF||proposal[u][v]>a*old[u][v]+b)valid=false;
   }
   out.append(valid?"Yes ":"No ").append(diameter).append('\n');
  }
  System.out.print(out);
 }
}
