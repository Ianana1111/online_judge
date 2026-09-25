import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   int n=fs.nextInt(),m=fs.nextInt(),k=fs.nextInt();int[]values=new int[n],frequency=new int[k+1];
   values[0]=1;values[1]=2;values[2]=3;
   for(int i=3;i<n;i++)values[i]=(values[i-1]+values[i-2]+values[i-3])%m+1;
   int left=0,covered=0,best=n+1;
   for(int right=0;right<n;right++){
    int value=values[right];if(value<=k&&++frequency[value]==1)covered++;
    while(covered==k){
     best=Math.min(best,right-left+1);
     int removed=values[left++];if(removed<=k&&--frequency[removed]==0)covered--;
    }
   }
   out.append("Case ").append(tc).append(": ");
   if(best>n)out.append("sequence nai");else out.append(best);
   out.append('\n');
  }
  System.out.print(out);
 }
}
