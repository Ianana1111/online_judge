import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
 }
 public static void main(String[] args)throws Exception{
  int[] mask={0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f};
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();String token;
  while((token=fs.next())!=null){int size=Integer.parseInt(token);String number=fs.next();
   if(size==0&&number.equals("0"))break;
   for(int row=0;row<2*size+3;row++){
    for(int index=0;index<number.length();index++){
     if(index>0)out.append(' ');int segments=mask[number.charAt(index)-'0'];
     if(row==0||row==size+1||row==2*size+2){
      int bit=row==0?0:row==size+1?6:3;out.append(' ');
      for(int col=0;col<size;col++)out.append((segments&(1<<bit))!=0?'-':' ');out.append(' ');
     }else{
      boolean upper=row<size+1;int left=upper?5:4,right=upper?1:2;
      out.append((segments&(1<<left))!=0?'|':' ');
      for(int col=0;col<size;col++)out.append(' ');
      out.append((segments&(1<<right))!=0?'|':' ');
     }
    }
    out.append('\n');
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
