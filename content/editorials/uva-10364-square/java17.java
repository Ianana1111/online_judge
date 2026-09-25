import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){int n=fs.nextInt(),total=0,largest=0;int[] sticks=new int[n];
   for(int i=0;i<n;i++){sticks[i]=fs.nextInt();total+=sticks[i];largest=Math.max(largest,sticks[i]);}
   if(total%4!=0||largest>total/4){out.append("no\n");continue;}
   int side=total/4,states=1<<n;int[] remainder=new int[states];Arrays.fill(remainder,-1);remainder[0]=0;
   for(int mask=0;mask<states;mask++)if(remainder[mask]>=0){
    for(int i=0;i<n;i++)if((mask&(1<<i))==0&&remainder[mask]+sticks[i]<=side){
     remainder[mask|(1<<i)]=(remainder[mask]+sticks[i])%side;
    }
   }
   out.append(remainder[states-1]==0?"yes\n":"no\n");
  }
  System.out.print(out);
 }
}
