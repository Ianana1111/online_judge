import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.PriorityQueue;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static final class State implements Comparable<State>{long distance;int u;State(long distance,int u){this.distance=distance;this.u=u;}
  public int compareTo(State other){return Long.compare(distance,other.distance);}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n,m;
  while((n=fs.nextInt())>=0){m=fs.nextInt();if(n==0&&m==0)break;
   int source=fs.nextInt()-1,target=fs.nextInt()-1,k=fs.nextInt();
   ArrayList<int[]>[] graph=new ArrayList[n];for(int i=0;i<n;i++)graph[i]=new ArrayList<>();
   for(int i=0;i<m;i++){int u=fs.nextInt()-1,v=fs.nextInt()-1,w=fs.nextInt();graph[u].add(new int[]{v,w});}
   int[] popped=new int[n];PriorityQueue<State> pending=new PriorityQueue<>();pending.add(new State(0,source));long answer=-1;
   while(!pending.isEmpty()){
    State state=pending.remove();int u=state.u;if(popped[u]>=k)continue;popped[u]++;
    if(u==target&&popped[u]==k){answer=state.distance;break;}
    for(int[] edge:graph[u])pending.add(new State(state.distance+edge[1],edge[0]));
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
