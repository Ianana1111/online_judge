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
  boolean[] prime=new boolean[10001];Arrays.fill(prime,true);prime[0]=prime[1]=false;
  for(int p=2;p*p<=10000;p++)if(prime[p])for(int j=p*p;j<=10000;j+=p)prime[j]=false;
  ArrayList<Integer> values=new ArrayList<>();for(int v=2;v<=10000;v++)if(prime[v])values.add(v);
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int target;
  while((target=fs.nextInt())>0){
   int left=0,sum=0,answer=0;
   for(int right=0;right<values.size()&&values.get(right)<=target;right++){
    sum+=values.get(right);while(sum>target)sum-=values.get(left++);
    if(sum==target)answer++;
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
