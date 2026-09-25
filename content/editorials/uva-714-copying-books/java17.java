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
   int n=(int)fs.nextLong(),k=(int)fs.nextLong();long[]pages=new long[n];boolean[]split=new boolean[n];
   long low=0,high=0;
   for(int i=0;i<n;i++){pages[i]=fs.nextLong();low=Math.max(low,pages[i]);high+=pages[i];}
   while(low<high){
    long limit=low+(high-low)/2,current=0;int groups=1;
    for(long value:pages){if(current+value>limit){groups++;current=0;}current+=value;}
    if(groups<=k)high=limit;else low=limit+1;
   }
   long current=0;int groups=k;
   for(int i=n-1;i>=0;i--){
    if(current+pages[i]>low||i+1<groups){split[i]=true;groups--;current=0;}
    current+=pages[i];
   }
   for(int i=0;i<n;i++){
    if(i>0)out.append(' ');out.append(pages[i]);if(split[i])out.append(" /");
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
