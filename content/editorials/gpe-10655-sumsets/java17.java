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
 static int lowerBound(long[] keys,long wanted){int lo=0,hi=keys.length;
  while(lo<hi){int mid=lo+(hi-lo)/2;if(keys[mid]<wanted)lo=mid+1;else hi=mid;}return lo;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>0){
   long[] values=new long[n];for(int i=0;i<n;i++)values[i]=fs.nextInt();Arrays.sort(values);
   long[] keys=new long[n*(n-1)/2];int at=0;
   for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)
    keys[at++]=((values[i]+values[j]+(1L<<30))<<20)|((long)i<<10)|j;
   Arrays.sort(keys);boolean found=false;long answer=0;
   for(int d=n-1;d>=0&&!found;d--)for(int c=0;c<n&&!found;c++)if(c!=d){
    long wanted=(values[d]-values[c]+(1L<<30))<<20;
    for(int pos=lowerBound(keys,wanted);pos<keys.length&&(keys[pos]>>20)==(wanted>>20);pos++){
     int i=(int)((keys[pos]>>10)&1023),j=(int)(keys[pos]&1023);
     if(i!=c&&i!=d&&j!=c&&j!=d){answer=values[d];found=true;break;}
    }
   }
   out.append(found?Long.toString(answer):"no solution").append('\n');
  }
  System.out.print(out);
 }
}
