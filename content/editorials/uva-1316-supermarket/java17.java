import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[]b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>=0){
   int[][]products=new int[n][2];
   for(int i=0;i<n;i++){int profit=fs.nextInt(),deadline=fs.nextInt();products[i]=new int[]{deadline,profit};}
   Arrays.sort(products,Comparator.comparingInt(p->p[0]));
   PriorityQueue<Integer>selected=new PriorityQueue<>();long total=0;
   for(int[]product:products){
    selected.add(product[1]);total+=product[1];
    if(selected.size()>product[0])total-=selected.remove();
   }
   out.append(total).append('\n');
  }
  System.out.print(out);
 }
}
