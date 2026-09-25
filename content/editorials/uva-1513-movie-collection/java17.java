import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static void add(int[]tree,int at,int delta){for(;at<tree.length;at+=at&-at)tree[at]+=delta;}
 static int prefix(int[]tree,int at){int result=0;for(;at>0;at-=at&-at)result+=tree[at];return result;}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int n=fs.nextInt(),m=fs.nextInt();int[]tree=new int[n+m+1],position=new int[n+1];int top=m;
   for(int movie=1;movie<=n;movie++){position[movie]=m+movie;add(tree,position[movie],1);}
   for(int request=0;request<m;request++){
    int movie=fs.nextInt();if(request>0)out.append(' ');
    out.append(prefix(tree,position[movie]-1));add(tree,position[movie],-1);
    position[movie]=top--;add(tree,position[movie],1);
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
