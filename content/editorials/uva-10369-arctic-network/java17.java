import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static int[]parent,size;
 static int find(int a){return parent[a]==a?a:(parent[a]=find(parent[a]));}
 static boolean join(int a,int b){a=find(a);b=find(b);if(a==b)return false;
  if(size[a]<size[b]){int tmp=a;a=b;b=tmp;}parent[b]=a;size[a]+=size[b];return true;}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int satellites=fs.nextInt(),n=fs.nextInt();int[]x=new int[n],y=new int[n];
   parent=new int[n];size=new int[n];
   for(int i=0;i<n;i++){x[i]=fs.nextInt();y[i]=fs.nextInt();parent[i]=i;size[i]=1;}
   long[][]edges=new long[n*(n-1)/2][3];int count=0;
   for(int i=0;i<n;i++)for(int j=i+1;j<n;j++){
    long dx=x[i]-x[j],dy=y[i]-y[j];edges[count++]=new long[]{dx*dx+dy*dy,i,j};
   }
   Arrays.sort(edges,Comparator.comparingLong(e->e[0]));int chosen=0;long answer=0;
   for(long[]edge:edges)if(join((int)edge[1],(int)edge[2])){
    answer=edge[0];if(++chosen==n-satellites)break;
   }
   out.append(String.format(Locale.US,"%.2f%n",Math.sqrt(answer)));
  }
  System.out.print(out);
 }
}
