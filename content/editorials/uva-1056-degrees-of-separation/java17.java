import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  StringTokenizer tokens=new StringTokenizer("");
  String next()throws IOException{while(!tokens.hasMoreTokens()){
   String line=reader.readLine();if(line==null)return null;tokens=new StringTokenizer(line);
  }return tokens.nextToken();}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();String first;StringBuilder out=new StringBuilder();int tc=0;
  while((first=fs.next())!=null){
   int n=Integer.parseInt(first),r=Integer.parseInt(fs.next());if(n==0&&r==0)break;
   int inf=1000000;int[][]dist=new int[n][n];
   for(int i=0;i<n;i++){Arrays.fill(dist[i],inf);dist[i][i]=0;}
   Map<String,Integer> names=new HashMap<>();
   for(int i=0;i<r;i++){
    String a=fs.next(),b=fs.next();
    if(!names.containsKey(a))names.put(a,names.size());
    if(!names.containsKey(b))names.put(b,names.size());
    int u=names.get(a),v=names.get(b);dist[u][v]=dist[v][u]=1;
   }
   for(int k=0;k<n;k++)for(int i=0;i<n;i++)for(int j=0;j<n;j++)
    dist[i][j]=Math.min(dist[i][j],dist[i][k]+dist[k][j]);
   int answer=0;for(int[]row:dist)for(int value:row)answer=Math.max(answer,value);
   out.append("Network ").append(++tc).append(": ");
   if(answer==inf)out.append("DISCONNECTED");else out.append(answer);
   out.append("\n\n");
  }
  System.out.print(out);
 }
}
