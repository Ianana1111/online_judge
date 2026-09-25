import java.io.BufferedInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return Integer.MIN_VALUE;int sign=1;if(c=='-'){sign=-1;c=read();}int value=0;while(c>32){value=value*10+c-'0';c=read();}return value*sign;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())!=Integer.MIN_VALUE){int m=fs.nextInt(),k=Math.min(n,m),total=0;
   BigInteger[] possible=new BigInteger[k+1];Arrays.fill(possible,BigInteger.ZERO);possible[0]=BigInteger.ONE.shiftLeft(2500);
   for(int i=0;i<n+m;i++){int value=fs.nextInt();total+=value;
    for(int count=Math.min(k,i+1);count>=1;count--){
     BigInteger shifted=value>=0?possible[count-1].shiftLeft(value):possible[count-1].shiftRight(-value);
     possible[count]=possible[count].or(shifted);
    }
   }
   long maximum=Long.MIN_VALUE,minimum=Long.MAX_VALUE;
   for(int sum=-2500;sum<=2500;sum++)if(possible[k].testBit(sum+2500)){
    long product=(long)sum*(total-sum);maximum=Math.max(maximum,product);minimum=Math.min(minimum,product);
   }
   out.append(maximum).append(' ').append(minimum).append('\n');
  }
  System.out.print(out);
 }
}
