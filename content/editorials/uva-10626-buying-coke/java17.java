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
 static int totalC,totalValue,maxFive,maxTen;static int[] memo;
 static int solve(int remaining,int fives,int tens){
  if(remaining==0)return 0;
  int index=(remaining*(maxFive+1)+fives)*(maxTen+1)+tens;
  if(memo[index]>=0)return memo[index];
  int ones=totalValue-8*(totalC-remaining)-5*fives-10*tens,answer=1000000;
  if(ones>=8)answer=Math.min(answer,8+solve(remaining-1,fives,tens));
  if(fives>=1&&ones>=3)answer=Math.min(answer,4+solve(remaining-1,fives-1,tens));
  if(fives>=2)answer=Math.min(answer,2+solve(remaining-1,fives-2,tens));
  if(tens>=1)answer=Math.min(answer,1+solve(remaining-1,fives,tens-1));
  if(tens>=1&&ones>=3)answer=Math.min(answer,4+solve(remaining-1,fives+1,tens-1));
  return memo[index]=answer;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   totalC=fs.nextInt();int ones=fs.nextInt(),fives=fs.nextInt(),tens=fs.nextInt();
   totalValue=ones+5*fives+10*tens;maxFive=fives+tens;maxTen=tens;
   memo=new int[(totalC+1)*(maxFive+1)*(maxTen+1)];Arrays.fill(memo,-1);
   out.append(solve(totalC,fives,tens)).append('\n');
  }
  System.out.print(out);
 }
}
