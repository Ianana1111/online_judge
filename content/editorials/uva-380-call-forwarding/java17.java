import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static void four(StringBuilder out,int value){if(value<1000)out.append('0');if(value<100)out.append('0');if(value<10)out.append('0');out.append(value);}
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder("CALL FORWARDING OUTPUT\n");
  for(int system=1;system<=tests;system++){
   List<int[]> requests=new ArrayList<>();int source;
   while((source=fs.nextInt())!=0)requests.add(new int[]{source,fs.nextInt(),fs.nextInt(),fs.nextInt()});
   out.append("SYSTEM ").append(system).append('\n');int time;
   while((time=fs.nextInt())!=9000){int extension=fs.nextInt(),current=extension;boolean[] seen=new boolean[10000];
    while(true){
     if(seen[current]){current=9999;break;}seen[current]=true;int next=-1;
     for(int[] request:requests)if(request[0]==current&&request[1]<=time&&time<=request[1]+request[2]){next=request[3];break;}
     if(next<0)break;current=next;
    }
    out.append("AT ");four(out,time);out.append(" CALL TO ");four(out,extension);out.append(" RINGS ");four(out,current);out.append('\n');
   }
  }
  out.append("END OF OUTPUT\n");System.out.print(out);
 }
}
