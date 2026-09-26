import java.io.BufferedInputStream;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
    static BufferedInputStream in=new BufferedInputStream(System.in);
    static int number()throws Exception{int c;do{c=in.read();}while(c>=0&&(c<'0'||c>'9'));if(c<0)return -1;int x=0;do{x=x*10+c-'0';c=in.read();}while(c>='0'&&c<='9');return x;}
    static class Edge{int to,reverse,capacity;Edge(int to,int reverse,int capacity){this.to=to;this.reverse=reverse;this.capacity=capacity;}}
    static class Dinic{
        List<List<Edge>> graph=new ArrayList<>();int[] level,current;
        Dinic(int n){for(int i=0;i<n;i++)graph.add(new ArrayList<>());level=new int[n];current=new int[n];}
        void add(int u,int v,int capacity){int a=graph.get(u).size(),b=graph.get(v).size();graph.get(u).add(new Edge(v,b,capacity));graph.get(v).add(new Edge(u,a,0));}
        boolean bfs(int source,int sink){Arrays.fill(level,-1);level[source]=0;ArrayDeque<Integer> queue=new ArrayDeque<>();queue.add(source);while(!queue.isEmpty()){int u=queue.remove();for(Edge e:graph.get(u))if(e.capacity>0&&level[e.to]<0){level[e.to]=level[u]+1;queue.add(e.to);}}return level[sink]>=0;}
        int send(int u,int sink,int amount){if(u==sink)return amount;List<Edge> row=graph.get(u);for(;current[u]<row.size();current[u]++){Edge e=row.get(current[u]);if(e.capacity>0&&level[e.to]==level[u]+1){int sent=send(e.to,sink,Math.min(amount,e.capacity));if(sent>0){e.capacity-=sent;graph.get(e.to).get(e.reverse).capacity+=sent;return sent;}}}return 0;}
        int flow(int source,int sink,int limit){int total=0;while(total<limit&&bfs(source,sink)){Arrays.fill(current,0);while(total<limit){int sent=send(source,sink,limit-total);if(sent==0)break;total+=sent;}}return total;}
    }
    public static void main(String[] args)throws Exception{int n;while((n=number())>=0){int m=number();boolean[][] adjacent=new boolean[n][n];for(int i=0;i<m;i++){int u=number(),v=number();adjacent[u][v]=adjacent[v][u]=true;}if(n<=1){System.out.println(n);continue;}int answer=n;boolean complete=true;for(int u=0;u<n;u++){int degree=0;for(boolean edge:adjacent[u])if(edge)degree++;answer=Math.min(answer,degree);if(degree<n-1)complete=false;}if(complete){System.out.println(n);continue;}
        for(int source=0;source<n&&answer>0;source++)for(int sink=source+1;sink<n&&answer>0;sink++){if(adjacent[source][sink])continue;Dinic network=new Dinic(2*n);for(int v=0;v<n;v++)network.add(2*v,2*v+1,v==source||v==sink?n:1);for(int u=0;u<n;u++)for(int v=0;v<n;v++)if(adjacent[u][v])network.add(2*u+1,2*v,n);answer=Math.min(answer,network.flow(2*source+1,2*sink,answer));}System.out.println(answer);
    }}
}
