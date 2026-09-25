import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static int lower(int[]a,int x){int lo=0,hi=a.length;
  while(lo<hi){int mid=(lo+hi)/2;if(a[mid]<x)lo=mid+1;else hi=mid;}return lo+1;}
 static int prefix(int[]tree,int at){int result=0;for(;at>0;at-=at&-at)result+=tree[at];return result;}
 static void add(int[]tree,int at){for(;at<tree.length;at+=at&-at)tree[at]++;}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>0){
   int[]values=new int[n],sorted=new int[n],tree=new int[n+1];
   for(int i=0;i<n;i++)values[i]=fs.nextInt();
   System.arraycopy(values,0,sorted,0,n);Arrays.sort(sorted);long answer=0;
   for(int i=0;i<n;i++){int rank=lower(sorted,values[i]);answer+=i-prefix(tree,rank);add(tree,rank);}
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
