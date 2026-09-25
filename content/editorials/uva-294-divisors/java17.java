import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  int limit=31622;boolean[]composite=new boolean[limit+1];ArrayList<Integer> primes=new ArrayList<>();
  for(int p=2;p<=limit;p++)if(!composite[p]){
   primes.add(p);if((long)p*p<=limit)for(int x=p*p;x<=limit;x+=p)composite[x]=true;
  }
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int low=fs.nextInt(),high=fs.nextInt(),length=high-low+1;
   long[]remaining=new long[length];int[]counts=new int[length];
   for(int i=0;i<length;i++){remaining[i]=(long)low+i;counts[i]=1;}
   for(int prime:primes){
    if((long)prime*prime>high)break;
    for(long value=((long)low+prime-1)/prime*prime;value<=high;value+=prime){
     int at=(int)(value-low),exponent=0;
     while(remaining[at]%prime==0){remaining[at]/=prime;exponent++;}
     counts[at]*=exponent+1;
    }
   }
   int best=0;
   for(int i=0;i<length;i++){
    if(remaining[i]>1)counts[i]*=2;
    if(counts[i]>counts[best])best=i;
   }
   out.append("Between ").append(low).append(" and ").append(high).append(", ")
    .append(low+best).append(" has a maximum of ").append(counts[best]).append(" divisors.\n");
  }
  System.out.print(out);
 }
}
