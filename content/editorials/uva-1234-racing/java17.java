import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static int[] parent,size;
 static int find(int x){while(parent[x]!=x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int n=fs.nextInt(),m=fs.nextInt();int[][] edges=new int[m][3];
   for(int i=0;i<m;i++){edges[i][1]=fs.nextInt();edges[i][2]=fs.nextInt();edges[i][0]=fs.nextInt();}
   Arrays.sort(edges,(a,b)->Integer.compare(b[0],a[0]));
   parent=new int[n+1];size=new int[n+1];for(int i=1;i<=n;i++){parent[i]=i;size[i]=1;}
   long answer=0;
   for(int[] edge:edges){int u=find(edge[1]),v=find(edge[2]);
    if(u==v){answer+=edge[0];continue;}
    if(size[u]<size[v]){int temp=u;u=v;v=temp;}
    parent[v]=u;size[u]+=size[v];
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
