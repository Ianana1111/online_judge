import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int sign=1;if(c=='-'){sign=-1;c=read();}int value=0;while(c>32){value=value*10+c-'0';c=read();}return value*sign;}
 }
 public static void main(String[] args)throws Exception{
  int limit=1000000;boolean[] prime=new boolean[limit];Arrays.fill(prime,true);prime[0]=prime[1]=false;
  for(int p=2;p*p<limit;p++)if(prime[p])for(int v=p*p;v<limit;v+=p)prime[v]=false;
  int[] prefix=new int[limit];
  for(int value=100;value<limit;value++){
   boolean good=prime[value];int power=1,length=1;
   for(int rest=value;rest>=10;rest/=10){power*=10;length++;}
   int rotated=value;
   for(int shift=1;good&&shift<length;shift++){
    rotated=(rotated%power)*10+rotated/power;
    if(!prime[rotated])good=false;
   }
   prefix[value]=prefix[value-1]+(good?1:0);
  }
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int left;
  while((left=fs.nextInt())!=-1){int right=fs.nextInt(),count=prefix[right]-prefix[left-1];
   if(count==0)out.append("No Circular Primes.\n");
   else if(count==1)out.append("1 Circular Prime.\n");
   else out.append(count).append(" Circular Primes.\n");
  }
  System.out.print(out);
 }
}
