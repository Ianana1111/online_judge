import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static int upper(int[]ends,int count,int value){int lo=0,hi=count;
  while(lo<hi){int mid=(lo+hi)/2;if(ends[mid]<=value)lo=mid+1;else hi=mid;}return lo;}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int n=fs.nextInt();int[][]ads=new int[n][3];
   for(int i=0;i<n;i++){
    int start=fs.nextInt(),length=fs.nextInt(),profit=fs.nextInt();
    ads[i]=new int[]{start+length,start,profit};
   }
   Arrays.sort(ads,Comparator.comparingInt(ad->ad[0]));int[]ends=new int[n];
   for(int i=0;i<n;i++)ends[i]=ads[i][0];long[]best=new long[n+1];
   for(int i=1;i<=n;i++){
    int compatible=upper(ends,i-1,ads[i-1][1]);
    best[i]=Math.max(best[i-1],best[compatible]+ads[i-1][2]);
   }
   out.append("Case ").append(tc).append(": ").append(best[n]).append('\n');
  }
  System.out.print(out);
 }
}
