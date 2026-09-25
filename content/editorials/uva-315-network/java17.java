import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
public class Main {
 static boolean[][] linked;static int[] entered,low;static boolean[] critical;static int timer,n;
 static void dfs(int u,int parent){
  entered[u]=low[u]=++timer;int children=0;
  for(int v=0;v<n;v++)if(linked[u][v]){
   if(entered[v]==0){children++;dfs(v,u);low[u]=Math.min(low[u],low[v]);
    if(parent!=-1&&low[v]>=entered[u])critical[u]=true;
   }else if(v!=parent)low[u]=Math.min(low[u],entered[v]);
  }
  if(parent==-1&&children>1)critical[u]=true;
 }
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;StringBuilder out=new StringBuilder();
  while((line=input.readLine())!=null){line=line.trim();if(line.isEmpty())continue;n=Integer.parseInt(line);if(n==0)break;
   linked=new boolean[n][n];
   while((line=input.readLine())!=null){String[] parts=line.trim().split("\\s+");int u=Integer.parseInt(parts[0]);if(u==0)break;u--;
    for(int i=1;i<parts.length;i++){int v=Integer.parseInt(parts[i])-1;linked[u][v]=linked[v][u]=true;}
   }
   entered=new int[n];low=new int[n];critical=new boolean[n];timer=0;dfs(0,-1);
   int answer=0;for(boolean value:critical)if(value)answer++;out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
