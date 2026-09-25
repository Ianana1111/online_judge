import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static int lower(long[]a,long x){int lo=0,hi=a.length;
  while(lo<hi){int mid=(lo+hi)/2;if(a[mid]<x)lo=mid+1;else hi=mid;}return lo;}
 static int upper(long[]a,long x){int lo=0,hi=a.length;
  while(lo<hi){int mid=(lo+hi)/2;if(a[mid]<=x)lo=mid+1;else hi=mid;}return lo;}
 public static void main(String[]args)throws Exception{
  final int bound=1000000;final long limit=999999999999L;
  boolean[]composite=new boolean[bound+1];
  for(int p=2;p*p<=bound;p++)if(!composite[p])for(int x=p*p;x<=bound;x+=p)composite[x]=true;
  ArrayList<Long>list=new ArrayList<>();
  for(int p=2;p<=bound;p++)if(!composite[p]){
   long value=(long)p*p;
   while(value<=limit){list.add(value);if(value>limit/p)break;value*=p;}
  }
  Collections.sort(list);long[]powers=new long[list.size()];
  for(int i=0;i<powers.length;i++)powers[i]=list.get(i);
  Scanner fs=new Scanner();int tests=(int)fs.nextLong();StringBuilder out=new StringBuilder();
  while(tests-->0){long low=fs.nextLong(),high=fs.nextLong();
   out.append(upper(powers,high)-lower(powers,low)).append('\n');}
  System.out.print(out);
 }
}
