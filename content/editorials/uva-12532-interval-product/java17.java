import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;
   StringBuilder s=new StringBuilder();while(c>32&&c>=0){s.append((char)c);c=read();}return s.toString();}
 }
 static void add(int[]tree,int at,int delta){for(;at<tree.length;at+=at&-at)tree[at]+=delta;}
 static int prefix(int[]tree,int at){int result=0;for(;at>0;at-=at&-at)result+=tree[at];return result;}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();String first;StringBuilder out=new StringBuilder();
  while((first=fs.next())!=null){
   int n=Integer.parseInt(first),k=Integer.parseInt(fs.next());
   int[]value=new int[n+1],zeros=new int[n+1],negatives=new int[n+1];
   for(int i=1;i<=n;i++){
    value[i]=Integer.parseInt(fs.next());add(zeros,i,value[i]==0?1:0);
    add(negatives,i,value[i]<0?1:0);
   }
   for(int j=0;j<k;j++){
    String op=fs.next();int left=Integer.parseInt(fs.next()),right=Integer.parseInt(fs.next());
    if(op.equals("C")){
     add(zeros,left,(right==0?1:0)-(value[left]==0?1:0));
     add(negatives,left,(right<0?1:0)-(value[left]<0?1:0));value[left]=right;
    }else if(prefix(zeros,right)-prefix(zeros,left-1)>0)out.append('0');
    else out.append((prefix(negatives,right)-prefix(negatives,left-1))%2!=0?'-':'+');
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
