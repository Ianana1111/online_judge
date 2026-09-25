import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;long value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static long[] prefix(long n){
  long[] answer=new long[10];
  for(long factor=1;factor<=n;factor*=10){
   long higher=n/(factor*10),digit=n/factor%10,lower=n%factor;
   for(int d=1;d<=9;d++){
    answer[d]+=higher*factor;
    if(digit>d)answer[d]+=factor;
    else if(digit==d)answer[d]+=lower+1;
   }
   if(higher>0)answer[0]+=(higher-1)*factor+(digit==0?lower+1:factor);
  }
  return answer;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();long a,b;
  while((a=fs.nextLong())>=0){b=fs.nextLong();if(a==0&&b==0)break;
   if(a>b){long temp=a;a=b;b=temp;}
   long[] before=prefix(a-1),after=prefix(b);
   for(int d=0;d<10;d++){if(d>0)out.append(' ');out.append(after[d]-before[d]);}out.append('\n');
  }
  System.out.print(out);
 }
}
