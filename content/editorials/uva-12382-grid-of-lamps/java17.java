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
  while(tests-->0){
   int m=fs.nextInt(),n=fs.nextInt();int[]a=new int[m],frequency=new int[m+1];
   for(int i=0;i<m;i++)a[i]=fs.nextInt();long excess=0;
   for(int j=0;j<n;j++){int b=fs.nextInt();frequency[b]++;excess+=b;}
   Arrays.sort(a);long prefix=0,answer=excess;int positive=n-frequency[0];
   for(int k=1;k<=m;k++){
    excess-=positive;positive-=frequency[k];prefix+=a[m-k];
    answer=Math.max(answer,prefix+excess);
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
