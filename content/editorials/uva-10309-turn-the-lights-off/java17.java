import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  StringTokenizer tokens=new StringTokenizer("");
  String next()throws IOException{while(!tokens.hasMoreTokens()){
   String line=reader.readLine();if(line==null)return null;tokens=new StringTokenizer(line);
  }return tokens.nextToken();}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();String name;StringBuilder out=new StringBuilder();
  while((name=fs.next())!=null&&!name.equals("end")){
   int[]lights=new int[10];
   for(int row=0;row<10;row++){
    String line=fs.next();
    for(int col=0;col<10;col++)if(line.charAt(col)=='O')lights[row]|=1<<col;
   }
   int best=101;
   for(int first=0;first<1024;first++){
    int previous=0,press=first,count=0;
    for(int row=0;row<10;row++){
     count+=Integer.bitCount(press);
     int next=lights[row]^press^((press<<1)&1023)^(press>>1)^previous;
     previous=press;press=next;
    }
    if(press==0)best=Math.min(best,count);
   }
   out.append(name).append(' ').append(best<=100?best:-1).append('\n');
  }
  System.out.print(out);
 }
}
