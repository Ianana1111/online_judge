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
  Scanner fs=new Scanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder();
  while(tests-->0){
   int length=Integer.parseInt(fs.next()),words=Integer.parseInt(fs.next());
   String previous=fs.next();int answer=length;
   for(int i=1;i<words;i++){
    String current=fs.next();int overlap=length;
    while(overlap>0&&!previous.regionMatches(length-overlap,current,0,overlap))overlap--;
    answer+=length-overlap;previous=current;
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
