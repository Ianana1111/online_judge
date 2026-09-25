import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int sign=1;if(c=='-'){sign=-1;c=read();}long x=0;
   while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x*sign;}
 }
 static int insert(long[]tails,int size,long value){
  int low=0,high=size;
  while(low<high){int mid=(low+high)/2;if(tails[mid]<value)low=mid+1;else high=mid;}
  tails[low]=value;return low;
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();long first;
  while((first=fs.nextLong())>=0){
   int n=(int)first;long[] values=new long[n],tails=new long[n];
   int[] left=new int[n],right=new int[n];
   for(int i=0;i<n;i++)values[i]=fs.nextLong();
   int size=0;
   for(int i=0;i<n;i++){int at=insert(tails,size,values[i]);if(at==size)size++;left[i]=at+1;}
   size=0;
   for(int i=n-1;i>=0;i--){int at=insert(tails,size,values[i]);if(at==size)size++;right[i]=at+1;}
   int answer=1;
   for(int i=0;i<n;i++)answer=Math.max(answer,2*Math.min(left[i],right[i])-1);
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
