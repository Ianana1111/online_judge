import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static long gcd(long a,long b){while(b!=0){long r=a%b;a=b;b=r;}return Math.abs(a);}
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>0){
   long a=fs.nextInt(),b=fs.nextInt(),total=0;int[] frequency=new int[101],prefix=new int[101];int largest=0;
   for(int i=0;i<n;i++){int y=fs.nextInt();frequency[y]++;total+=y;largest=Math.max(largest,y);}
   for(int y=1;y<=100;y++)prefix[y]=prefix[y-1]+frequency[y];
   long bestNum=Long.MAX_VALUE,bestDen=1;
   for(int p=1;p<=100;p++)if(frequency[p]>0)for(int q=1;q<=3;q++){
    if(3*p<largest*q)continue;
    long visits=3L*n-prefix[p/q]-prefix[Math.min(100,2*p/q)];
    long num=(a*p+b*q)*visits-a*total*q;
    if(bestNum==Long.MAX_VALUE||num*bestDen<bestNum*q){bestNum=num;bestDen=q;}
   }
   long divisor=gcd(bestNum,bestDen);bestNum/=divisor;bestDen/=divisor;
   out.append(bestNum);if(bestDen!=1)out.append(" / ").append(bestDen);out.append('\n');
  }
  System.out.print(out);
 }
}
