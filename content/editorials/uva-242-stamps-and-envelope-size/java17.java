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
 static int coverage(int limit,int[] stamps){
  int maximum=limit*stamps[stamps.length-1];int[] dp=new int[maximum+1];Arrays.fill(dp,limit+1);dp[0]=0;
  for(int amount=1;amount<=maximum;amount++){
   for(int coin:stamps)if(coin<=amount)dp[amount]=Math.min(dp[amount],dp[amount-coin]+1);
   if(dp[amount]>limit)return amount-1;
  }
  return maximum;
 }
 static boolean smallerReverse(int[] candidate,int[] best){
  for(int i=candidate.length-1;i>=0;i--)if(candidate[i]!=best[i])return candidate[i]<best[i];
  return false;
 }
 static void padded(StringBuilder out,int value,int width){String text=Integer.toString(value);for(int i=text.length();i<width;i++)out.append(' ');out.append(text);}
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int limit;
  while((limit=fs.nextInt())>0){int n=fs.nextInt(),bestCoverage=-1;int[] best=new int[0];
   while(n-->0){int count=fs.nextInt();int[] candidate=new int[count];for(int i=0;i<count;i++)candidate[i]=fs.nextInt();
    int covered=coverage(limit,candidate);
    if(covered>bestCoverage||covered==bestCoverage&&(candidate.length<best.length||candidate.length==best.length&&smallerReverse(candidate,best))){bestCoverage=covered;best=candidate;}
   }
   out.append("max coverage =");padded(out,bestCoverage,4);out.append(" :");
   for(int coin:best)padded(out,coin,3);out.append('\n');
  }
  System.out.print(out);
 }
}
