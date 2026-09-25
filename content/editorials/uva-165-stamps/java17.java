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
 static int h,k,best;
 static void search(int used,int last,int coverage,int[] coins){
  if(used==k){best=Math.max(best,coverage);return;}
  int upper=coverage;for(int left=used;left<k;left++)upper=h*(upper+1);
  if(upper<=best)return;
  for(int denomination=coverage+1;denomination>last;denomination--){
   int[] next=new int[h*denomination+1];Arrays.fill(next,h+1);
   System.arraycopy(coins,0,next,0,Math.min(coins.length,next.length));
   for(int value=denomination;value<next.length;value++)next[value]=Math.min(next[value],next[value-denomination]+1);
   int range=coverage;while(range+1<next.length&&next[range+1]<=h)range++;
   search(used+1,denomination,range,next);
  }
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int[][] cache=new int[10][10];for(int[] row:cache)Arrays.fill(row,-1);
  while((h=fs.nextInt())>=0){k=fs.nextInt();if(h==0&&k==0)break;
   if(cache[h][k]<0){best=0;int[] coins=new int[h+1];for(int i=0;i<=h;i++)coins[i]=i;search(1,1,h,coins);cache[h][k]=best;}
   out.append(cache[h][k]).append('\n');
  }
  System.out.print(out);
 }
}
