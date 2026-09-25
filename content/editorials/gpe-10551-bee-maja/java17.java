import java.io.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 public static void main(String[]args)throws Exception{
  int[] xs=new int[100000],ys=new int[100000];
  int[] dx={-1,-1,0,1,1,0},dy={1,0,-1,-1,0,1};
  int label=1,x=0,y=0;
  for(int ring=1;label<99999;ring++){
   y++;label++;if(label<=99999){xs[label]=x;ys[label]=y;}
   for(int d=0;d<6;d++)for(int j=0;j<(d==0?ring-1:ring);j++){
    x+=dx[d];y+=dy[d];label++;if(label<=99999){xs[label]=x;ys[label]=y;}
   }
  }
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int v;
  while((v=fs.nextInt())>=0)out.append(xs[v]).append(' ').append(ys[v]).append('\n');
  System.out.print(out);
 }
}
