import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   long x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static long prefix(long n){
  if(n<0)return 0;long total=0,count=n+1;
  for(long bit=1;bit<=n;bit*=2){
   long period=2*bit,remainder=count%period;
   total+=count/period*bit+Math.max(0,remainder-bit);
  }
  return total;
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();long left;int tc=0;
  while((left=fs.nextLong())>=0){long right=fs.nextLong();if(left==0&&right==0)break;
   out.append("Case ").append(++tc).append(": ").append(prefix(right)-prefix(left-1)).append('\n');
  }
  System.out.print(out);
 }
}
