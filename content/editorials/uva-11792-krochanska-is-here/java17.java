import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int n=fs.nextInt(),s=fs.nextInt();ArrayList<Integer>[] graph=new ArrayList[n];
   for(int i=0;i<n;i++)graph[i]=new ArrayList<>();int[] lines=new int[n],seen=new int[n];
   for(int route=1;route<=s;route++){
    int previous=-1,v;
    while((v=fs.nextInt())!=0){v--;
     if(seen[v]!=route){seen[v]=route;lines[v]++;}
     if(previous>=0){graph[previous].add(v);graph[v].add(previous);}previous=v;
    }
   }
   int[] important=new int[n];int count=0;
   for(int i=0;i<n;i++)if(lines[i]>1)important[count++]=i;
   long best=Long.MAX_VALUE;int answer=-1;
   int[] distance=new int[n],queue=new int[n];
   for(int i=0;i<count;i++){
    int start=important[i];Arrays.fill(distance,-1);distance[start]=0;queue[0]=start;int front=0,back=1;
    while(front<back){int u=queue[front++];
     for(int v:graph[u])if(distance[v]<0){distance[v]=distance[u]+1;queue[back++]=v;}
    }
    long sum=0;for(int j=0;j<count;j++)sum+=distance[important[j]];
    if(sum<best){best=sum;answer=start;}
   }
   out.append("Krochanska is in: ").append(answer+1).append('\n');
  }
  System.out.print(out);
 }
}
