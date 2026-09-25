import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int t=1;t<=tests;t++){
   int n=fs.nextInt(),k=fs.nextInt();long answer=0;
   if(n%2==0&&k>0){
    int half=n/2;long[][] dp=new long[half+1][k];dp[1][1%k]=1;
    for(int length=1;length<n;length++){
     long[][] next=new long[half+1][k];
     for(int ones=0;ones<=half;ones++)for(int residue=0;residue<k;residue++){
      long ways=dp[ones][residue];if(ways==0)continue;
      next[ones][2*residue%k]+=ways;
      if(ones<half)next[ones+1][(2*residue+1)%k]+=ways;
     }
     dp=next;
    }
    answer=dp[half][0];
   }
   out.append("Case ").append(t).append(": ").append(answer).append('\n');
  }
  System.out.print(out);
 }
}
