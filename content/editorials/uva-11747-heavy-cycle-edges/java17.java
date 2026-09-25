import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static int[]parent,size;
 static int find(int x){while(parent[x]!=x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>=0){int m=fs.nextInt();if(n==0&&m==0)break;
   int[][]edges=new int[m][3];
   for(int i=0;i<m;i++){edges[i][1]=fs.nextInt();edges[i][2]=fs.nextInt();edges[i][0]=fs.nextInt();}
   Arrays.sort(edges,Comparator.comparingInt(e->e[0]));parent=new int[n];size=new int[n];
   for(int i=0;i<n;i++){parent[i]=i;size[i]=1;}
   int count=0;
   for(int[]edge:edges){int u=find(edge[1]),v=find(edge[2]);
    if(u==v){if(count++>0)out.append(' ');out.append(edge[0]);}
    else{if(size[u]<size[v]){int tmp=u;u=v;v=tmp;}parent[v]=u;size[u]+=size[v];}
   }
   if(count==0)out.append("forest");out.append('\n');
  }
  System.out.print(out);
 }
}
