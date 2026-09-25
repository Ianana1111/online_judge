import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int n=fs.nextInt();ArrayList<int[]>[] graph=new ArrayList[n];
   for(int i=0;i<n;i++)graph[i]=new ArrayList<>();
   for(int i=1;i<n;i++){int u=fs.nextInt()-1,v=fs.nextInt()-1,w=fs.nextInt();
    graph[u].add(new int[]{v,w});graph[v].add(new int[]{u,w});
   }
   long[] frequency=new long[n],subtree=new long[n],cost=new long[n],distance=new long[n];
   int m=fs.nextInt();while(m-->0){int u=fs.nextInt()-1;frequency[u]=fs.nextInt();}
   int[] parent=new int[n],edge=new int[n],order=new int[n];parent[0]=0;order[0]=0;int count=1;
   for(int index=0;index<count;index++){int u=order[index];
    for(int[] neighbor:graph[u]){int v=neighbor[0],w=neighbor[1];if(v==parent[u])continue;
     parent[v]=u;edge[v]=w;distance[v]=distance[u]+w;order[count++]=v;
    }
   }
   long total=0;for(int u=0;u<n;u++){total+=frequency[u];cost[0]+=frequency[u]*distance[u];subtree[u]=frequency[u];}
   for(int i=n-1;i>0;i--){int u=order[i];subtree[parent[u]]+=subtree[u];}
   for(int i=1;i<n;i++){int v=order[i],u=parent[v];cost[v]=cost[u]+(long)edge[v]*(total-2*subtree[v]);}
   long best=cost[0];for(long value:cost)best=Math.min(best,value);
   out.append(2*best).append('\n');boolean first=true;
   for(int u=0;u<n;u++)if(cost[u]==best){if(!first)out.append(' ');out.append(u+1);first=false;}
   out.append('\n');
  }
  System.out.print(out);
 }
}
