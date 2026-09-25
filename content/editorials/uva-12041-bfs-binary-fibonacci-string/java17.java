import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;long value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static final long[] length=new long[48];
 static char digit(int level,long position){
  while(level>=2){long split=length[level-2];if(position<split)level-=2;else{position-=split;level--;}}
  return (char)('0'+level);
 }
 public static void main(String[] args)throws Exception{
  length[0]=length[1]=1;for(int i=2;i<48;i++)length[i]=length[i-2]+length[i-1];
  FastScanner fs=new FastScanner();int tests=(int)fs.nextLong();StringBuilder out=new StringBuilder();
  while(tests-->0){long n=fs.nextLong(),left=fs.nextLong(),right=fs.nextLong();
   if(n>47)n=46+(n-46)%2;
   for(long p=left;p<=right;p++)out.append(digit((int)n,p));out.append('\n');
  }
  System.out.print(out);
 }
}
