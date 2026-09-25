import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  long nextLong()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;long value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static final class Block {long x,y,height;Block(long x,long y,long height){this.x=x;this.y=y;this.height=height;}}
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int tc=0,n;
  while((n=(int)fs.nextLong())>0){Block[] blocks=new Block[3*n];int count=0;
   for(int i=0;i<n;i++){long[] d={fs.nextLong(),fs.nextLong(),fs.nextLong()};
    for(int h=0;h<3;h++){long x=d[(h+1)%3],y=d[(h+2)%3];if(x>y){long temp=x;x=y;y=temp;}
     blocks[count++]=new Block(x,y,d[h]);
    }
   }
   Arrays.sort(blocks,(a,b)->a.x==b.x?Long.compare(a.y,b.y):Long.compare(a.x,b.x));
   long[] best=new long[count];long answer=0;
   for(int i=0;i<count;i++){best[i]=blocks[i].height;
    for(int j=0;j<i;j++)if(blocks[j].x<blocks[i].x&&blocks[j].y<blocks[i].y)
     best[i]=Math.max(best[i],blocks[i].height+best[j]);
    answer=Math.max(answer,best[i]);
   }
   out.append("Case ").append(++tc).append(": maximum height = ").append(answer).append('\n');
  }
  System.out.print(out);
 }
}
