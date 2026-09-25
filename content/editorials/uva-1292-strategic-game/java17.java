import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c>=0&&(c<'0'||c>'9'));if(c<0)return -1;
   int value=0;while(c>='0'&&c<='9'){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>=0){
   ArrayList<Integer>[] graph=new ArrayList[n];for(int i=0;i<n;i++)graph[i]=new ArrayList<>();
   for(int i=0;i<n;i++){int u=fs.nextInt(),k=fs.nextInt();
    while(k-->0){int v=fs.nextInt();graph[u].add(v);graph[v].add(u);}
   }
   int[] parent=new int[n],order=new int[n],off=new int[n],on=new int[n];
   java.util.Arrays.fill(parent,-1);java.util.Arrays.fill(on,1);parent[0]=0;order[0]=0;int count=1;
   for(int i=0;i<count;i++){int u=order[i];
    for(int v:graph[u])if(v!=parent[u]){parent[v]=u;order[count++]=v;}
   }
   for(int i=count-1;i>=0;i--){int u=order[i];
    for(int v:graph[u])if(parent[v]==u){off[u]+=on[v];on[u]+=Math.min(off[v],on[v]);}
   }
   out.append(Math.min(off[0],on[0])).append('\n');
  }
  System.out.print(out);
 }
}
