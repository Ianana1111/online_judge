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
  Scanner fs=new Scanner();String first;StringBuilder out=new StringBuilder();
  while((first=fs.next())!=null){
   int[] c=new int[9];c[0]=Integer.parseInt(first);
   for(int i=1;i<9;i++)c[i]=Integer.parseInt(fs.next());
   boolean empty=true;
   for(int i=0;i<9;i++){
    int value=c[i],degree=8-i;if(value==0)continue;
    if(empty){if(value<0)out.append('-');}else out.append(value<0?" - ":" + ");
    int magnitude=Math.abs(value);
    if(degree==0||magnitude!=1)out.append(magnitude);
    if(degree>0){out.append('x');if(degree>1)out.append('^').append(degree);}
    empty=false;
   }
   if(empty)out.append('0');out.append('\n');
  }
  System.out.print(out);
 }
}
