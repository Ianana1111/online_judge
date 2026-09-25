import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return Long.MIN_VALUE;int sign=1;if(c=='-'){sign=-1;c=read();}long value=0;while(c>32){value=value*10+c-'0';c=read();}return value*sign;}
 }
 static long[] sums(long[] values,int begin,int end){
  long[] result=new long[1<<(end-begin)];int used=1;
  for(int i=begin;i<end;i++){for(int j=0;j<used;j++)result[used+j]=result[j]+values[i];used*=2;}
  Arrays.sort(result);return result;
 }
 static int lowerBound(long[] values,long wanted){int lo=0,hi=values.length;
  while(lo<hi){int mid=lo+(hi-lo)/2;if(values[mid]<wanted)lo=mid+1;else hi=mid;}return lo;
 }
 static int upperBound(long[] values,long wanted){int lo=0,hi=values.length;
  while(lo<hi){int mid=lo+(hi-lo)/2;if(values[mid]<=wanted)lo=mid+1;else hi=mid;}return lo;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();long raw;
  while((raw=fs.nextLong())!=Long.MIN_VALUE){int n=(int)raw;long target=fs.nextLong();long[] values=new long[n];for(int i=0;i<n;i++)values[i]=fs.nextLong();
   long[] left=sums(values,0,n/2);long answer=0,current=0;int previous=0;
   for(int mask=0;mask<(1<<(n-n/2));mask++){
    int gray=mask^(mask>>1);
    if(mask!=0){int changed=gray^previous,index=Integer.numberOfTrailingZeros(changed);
     current+=(gray&changed)!=0?values[n/2+index]:-values[n/2+index];
    }
    long wanted=target-current;
    answer+=upperBound(left,wanted)-lowerBound(left,wanted);
    previous=gray;
   }
   if(target==0)answer--;out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
