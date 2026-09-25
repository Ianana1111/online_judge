import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>=0){int c=fs.nextInt(),t1=fs.nextInt(),t2=fs.nextInt();int[] hole=new int[2*n];
   for(int i=0;i<n;i++)hole[i]=fs.nextInt();Arrays.sort(hole,0,n);
   for(int i=0;i<n;i++)hole[n+i]=hole[i]+c;
   int[][] next=new int[2][2*n];int[] length={t1,t2};
   for(int kind=0;kind<2;kind++){int pointer=0;
    for(int i=0;i<2*n;i++){while(pointer<2*n&&hole[pointer]<=hole[i]+length[kind])pointer++;next[kind][i]=pointer;}
   }
   long[] dp=new long[2*n+1];long answer=Long.MAX_VALUE;
   for(int start=0;start<n;start++){int end=start+n;dp[end]=0;
    for(int i=end-1;i>=start;i--){
     long first=t1+dp[Math.min(end,next[0][i])],second=t2+dp[Math.min(end,next[1][i])];
     dp[i]=Math.min(first,second);
    }
    answer=Math.min(answer,dp[start]);
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
