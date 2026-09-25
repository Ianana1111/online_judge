import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.TreeMap;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();ArrayList<int[]> events=new ArrayList<>();int left;
  while((left=fs.nextInt())>=0){int height=fs.nextInt(),right=fs.nextInt();
   events.add(new int[]{left,height,1});events.add(new int[]{right,height,-1});
  }
  events.sort(Comparator.comparingInt(e->e[0]));TreeMap<Integer,Integer> active=new TreeMap<>();
  StringBuilder out=new StringBuilder();int previous=0;
  for(int at=0;at<events.size();){int x=events.get(at)[0];
   while(at<events.size()&&events.get(at)[0]==x){int[] event=events.get(at++);
    int count=active.getOrDefault(event[1],0)+event[2];
    if(count==0)active.remove(event[1]);else active.put(event[1],count);
   }
   int current=active.isEmpty()?0:active.lastKey();
   if(current!=previous){if(out.length()>0)out.append(' ');out.append(x).append(' ').append(current);previous=current;}
  }
  out.append('\n');System.out.print(out);
 }
}
