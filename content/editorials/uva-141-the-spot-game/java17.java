import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 static String canonical(char[] board,int n){
  char[] current=board.clone();String best=new String(current);
  for(int turn=0;turn<4;turn++){
   String text=new String(current);if(text.compareTo(best)<0)best=text;
   char[] next=new char[n*n];
   for(int r=0;r<n;r++)for(int c=0;c<n;c++)next[c*n+n-1-r]=current[r*n+c];
   current=next;
  }
  return best;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())!=0){
   char[] board=new char[n*n];Arrays.fill(board,'0');HashSet<String> seen=new HashSet<>();int winner=0,losing=0;
   for(int step=1;step<=2*n;step++){
    int r=fs.nextInt(),c=fs.nextInt();char op=fs.next().charAt(0);board[(r-1)*n+c-1]=op=='+'?'1':'0';
    if(winner!=0)continue;String key=canonical(board,n);
    if(seen.contains(key)){winner=step%2==1?2:1;losing=step;}seen.add(key);
   }
   if(winner!=0)out.append("Player ").append(winner).append(" wins on move ").append(losing).append('\n');
   else out.append("Draw\n");
  }
  System.out.print(out);
 }
}
