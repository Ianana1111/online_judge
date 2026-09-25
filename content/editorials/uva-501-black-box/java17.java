import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.PriorityQueue;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int sign=1;if(c=='-'){sign=-1;c=read();}int value=0;while(c>32){value=value*10+c-'0';c=read();}return value*sign;}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int t=0;t<tests;t++){
   int m=fs.nextInt(),n=fs.nextInt();int[] values=new int[m],queries=new int[n];
   for(int i=0;i<m;i++)values[i]=fs.nextInt();for(int i=0;i<n;i++)queries[i]=fs.nextInt();
   PriorityQueue<Integer> lower=new PriorityQueue<>(Collections.reverseOrder());
   PriorityQueue<Integer> upper=new PriorityQueue<>();int inserted=0;
   if(t>0)out.append('\n');
   for(int count:queries){
    while(inserted<count){int value=values[inserted++];
     if(!lower.isEmpty()&&value<lower.peek()){lower.add(value);upper.add(lower.remove());}
     else upper.add(value);
    }
    lower.add(upper.remove());out.append(lower.peek()).append('\n');
   }
  }
  System.out.print(out);
 }
}
