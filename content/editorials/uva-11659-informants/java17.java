import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int sign=1;if(c=='-'){sign=-1;c=read();}int x=0;
   while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x*sign;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>=0){
   int a=fs.nextInt();if(n==0&&a==0)break;
   int[]positive=new int[n],negative=new int[n];
   while(a-->0){int speaker=fs.nextInt()-1,target=fs.nextInt();
    if(target>0)positive[speaker]|=1<<(target-1);
    else negative[speaker]|=1<<(-target-1);
   }
   int best=0;
   for(int mask=0;mask<(1<<n);mask++){
    int count=Integer.bitCount(mask);if(count<=best)continue;
    boolean valid=true;
    for(int i=0;i<n&&valid;i++)if((mask&(1<<i))!=0){
     if((positive[i]&mask)!=positive[i]||(negative[i]&mask)!=0)valid=false;
    }
    if(valid)best=count;
    if(best==n)break;
   }
   out.append(best).append('\n');
  }
  System.out.print(out);
 }
}
