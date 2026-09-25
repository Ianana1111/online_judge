import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>0){
   int[]parent=new int[n],balance=new int[n],head=new int[n],next=new int[n],order=new int[n];
   Arrays.fill(parent,-1);Arrays.fill(head,-1);
   for(int i=0;i<n;i++){
    int node=fs.nextInt()-1,marbles=fs.nextInt(),count=fs.nextInt();balance[node]=marbles-1;
    while(count-->0){int child=fs.nextInt()-1;parent[child]=node;next[child]=head[node];head[node]=child;}
   }
   int root=0;while(parent[root]!=-1)root++;
   int size=1;order[0]=root;
   for(int i=0;i<size;i++)for(int child=head[order[i]];child!=-1;child=next[child])order[size++]=child;
   long moves=0;
   for(int i=n-1;i>0;i--){int node=order[i];moves+=Math.abs((long)balance[node]);balance[parent[node]]+=balance[node];}
   out.append(moves).append('\n');
  }
  System.out.print(out);
 }
}
