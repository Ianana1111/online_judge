import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=(int)fs.nextLong();StringBuilder out=new StringBuilder();
  while(tests-->0){
   long n=fs.nextLong(),m=fs.nextLong(),excess=m-(n-1),low=1,high=n;
   while(low<high){long mid=(low+high)/2;
    if((mid-1)*(mid-2)/2>=excess)high=mid;else low=mid+1;}
   out.append(n-low).append('\n');
  }
  System.out.print(out);
 }
}
