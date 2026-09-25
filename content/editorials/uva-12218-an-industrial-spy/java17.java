import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
 }
 static final int LIMIT=10000000;static final boolean[] prime=new boolean[LIMIT];
 static int[] remaining=new int[10];static int answer,length;
 static void search(int value,int used){
  if(prime[value])answer++;
  if(used==length)return;
  for(int digit=0;digit<=9;digit++)if(remaining[digit]>0){
   if(used==0&&digit==0)continue;
   remaining[digit]--;search(value*10+digit,used+1);remaining[digit]++;
  }
 }
 public static void main(String[] args)throws Exception{
  Arrays.fill(prime,true);prime[0]=prime[1]=false;
  for(int p=2;p*p<LIMIT;p++)if(prime[p])for(int v=p*p;v<LIMIT;v+=p)prime[v]=false;
  FastScanner fs=new FastScanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder();
  while(tests-->0){String digits=fs.next();length=digits.length();answer=0;Arrays.fill(remaining,0);
   for(int i=0;i<length;i++)remaining[digits.charAt(i)-'0']++;
   search(0,0);out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
