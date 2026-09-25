import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.TreeMap;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder();
  for(int t=1;t<=tests;t++){
   String trend=fs.next();int n=trend.length(),height=0;TreeMap<Integer,char[]> rows=new TreeMap<>();
   for(int x=0;x<n;x++){
    char ch=trend.charAt(x);if(ch=='F')height--;
    char[] row=rows.get(height);if(row==null){row=new char[n];Arrays.fill(row,' ');rows.put(height,row);}
    row[x]=ch=='R'?'/':ch=='F'?'\\':'_';if(ch=='R')height++;
   }
   out.append("Case #").append(t).append(":\n");
   for(int y=rows.lastKey();y>=rows.firstKey();y--){char[] row=rows.get(y);int end=n;
    if(row==null)end=0;else while(end>0&&row[end-1]==' ')end--;
    out.append("| ");if(end>0)out.append(row,0,end);out.append('\n');
   }
   out.append('+');for(int x=0;x<n+2;x++)out.append('-');out.append("\n\n");
  }
  System.out.print(out);
 }
}
