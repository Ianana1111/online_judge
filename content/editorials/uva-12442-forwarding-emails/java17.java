import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int n=fs.nextInt();int[] next=new int[n],indegree=new int[n],reach=new int[n],queue=new int[n],removed=new int[n];
   for(int i=0;i<n;i++){int u=fs.nextInt()-1,v=fs.nextInt()-1;next[u]=v;indegree[v]++;}
   int head=0,tail=0,count=0;for(int i=0;i<n;i++)if(indegree[i]==0)queue[tail++]=i;
   while(head<tail){int u=queue[head++];removed[count++]=u;int v=next[u];if(--indegree[v]==0)queue[tail++]=v;}
   for(int start=0;start<n;start++)if(indegree[start]>0&&reach[start]==0){
    int size=0,at=start;do{size++;at=next[at];}while(at!=start);
    at=start;do{reach[at]=size;at=next[at];}while(at!=start);
   }
   for(int i=count-1;i>=0;i--){int u=removed[i];reach[u]=reach[next[u]]+1;}
   int best=0;for(int i=1;i<n;i++)if(reach[i]>reach[best])best=i;
   out.append("Case ").append(tc).append(": ").append(best+1).append('\n');
  }
  System.out.print(out);
 }
}
