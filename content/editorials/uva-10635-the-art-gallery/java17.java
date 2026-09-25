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
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int n=fs.nextInt(),p=fs.nextInt(),q=fs.nextInt();int[]position=new int[n*n+1],tails=new int[q+1];
   Arrays.fill(position,-1);
   for(int i=0;i<=p;i++)position[fs.nextInt()]=i;
   int size=0;
   for(int i=0;i<=q;i++){
    int value=fs.nextInt(),rank=position[value];if(rank<0)continue;
    int lo=0,hi=size;
    while(lo<hi){int mid=(lo+hi)/2;if(tails[mid]<rank)lo=mid+1;else hi=mid;}
    tails[lo]=rank;if(lo==size)size++;
   }
   out.append("Case ").append(tc).append(": ").append(size).append('\n');
  }
  System.out.print(out);
 }
}
