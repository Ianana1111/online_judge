import java.io.*;
public class Main{
 static final long MOD=1000000007L;
 static long[]factorial=new long[1001],inverse=new long[1001];
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static long power(long a,long exponent){long result=1;
  while(exponent>0){if((exponent&1)!=0)result=result*a%MOD;a=a*a%MOD;exponent>>=1;}return result;}
 static long choose(int n,int k){return factorial[n]*inverse[k]%MOD*inverse[n-k]%MOD;}
 public static void main(String[]args)throws Exception{
  factorial[0]=1;for(int i=1;i<=1000;i++)factorial[i]=factorial[i-1]*i%MOD;
  inverse[1000]=power(factorial[1000],MOD-2);
  for(int i=1000;i>0;i--)inverse[i-1]=inverse[i]*i%MOD;
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int n=fs.nextInt(),m=fs.nextInt(),k=fs.nextInt();long valid=0;
   for(int j=0;j<=m-k;j++){
    long term=choose(m-k,j)*factorial[n-k-j]%MOD;
    valid=(valid+((j&1)!=0?MOD-term:term))%MOD;
   }
   out.append("Case ").append(tc).append(": ").append(choose(m,k)*valid%MOD).append('\n');
  }
  System.out.print(out);
 }
}
