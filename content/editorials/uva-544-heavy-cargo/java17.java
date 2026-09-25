import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  StringTokenizer tokens=new StringTokenizer("");
  String next()throws IOException{while(!tokens.hasMoreTokens()){
   String line=reader.readLine();if(line==null)return null;tokens=new StringTokenizer(line);
  }return tokens.nextToken();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 static int index(Map<String,Integer>names,String name){
  Integer found=names.get(name);if(found!=null)return found;
  int id=names.size();names.put(name,id);return id;
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n,scenario=0;
  while((n=fs.nextInt())>0){
   int r=fs.nextInt();Map<String,Integer>names=new HashMap<>();int[][]capacity=new int[n][n];
   for(int i=0;i<r;i++){
    int a=index(names,fs.next()),b=index(names,fs.next()),w=fs.nextInt();
    capacity[a][b]=capacity[b][a]=Math.max(capacity[a][b],w);
   }
   int start=index(names,fs.next()),target=index(names,fs.next());
   int[]best=new int[n];boolean[]settled=new boolean[n];best[start]=10001;
   for(int step=0;step<n;step++){
    int u=-1;for(int v=0;v<n;v++)if(!settled[v]&&(u<0||best[v]>best[u]))u=v;
    if(u<0||best[u]==0)break;settled[u]=true;
    for(int v=0;v<n;v++)best[v]=Math.max(best[v],Math.min(best[u],capacity[u][v]));
   }
   out.append("Scenario #").append(++scenario).append('\n').append(best[target]).append(" tons\n\n");
  }
  System.out.print(out);
 }
}
