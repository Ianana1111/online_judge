import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int t=0;t<tests;t++){
   int n=fs.nextInt(),k=fs.nextInt();int[][] side=new int[k][n+1];int[] result=new int[k];
   for(int j=0;j<k;j++){
    int count=fs.nextInt();
    for(int i=0;i<count;i++)side[j][fs.nextInt()]=1;
    for(int i=0;i<count;i++)side[j][fs.nextInt()]=-1;
    String symbol=fs.next();result[j]=symbol.equals("<")?-1:symbol.equals(">")?1:0;
   }
   int candidates=0,answer=0;
   for(int coin=1;coin<=n;coin++){
    boolean possible=false;
    for(int direction=-1;direction<=1;direction+=2){boolean consistent=true;
     for(int j=0;j<k;j++)if(side[j][coin]*direction!=result[j]){consistent=false;break;}
     if(consistent)possible=true;
    }
    if(possible){candidates++;answer=coin;}
   }
   if(t>0)out.append('\n');out.append(candidates==1?answer:0).append('\n');
  }
  System.out.print(out);
 }
}
