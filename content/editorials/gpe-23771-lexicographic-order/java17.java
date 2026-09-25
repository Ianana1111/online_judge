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
  long[]factorial=new long[21];factorial[0]=1;
  for(int i=1;i<=20;i++)factorial[i]=factorial[i-1]*i;
  Scanner fs=new Scanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder();
  for(int tc=1;tc<=tests;tc++){
   String word=fs.next();long rank=Long.parseLong(fs.next())-1;int n=word.length();
   ArrayList<Integer>available=new ArrayList<>();char[]order=new char[n];
   for(int i=0;i<n;i++)available.add(i);
   for(int i=0;i<n;i++){
    int index=(int)(rank/factorial[n-i-1]);rank%=factorial[n-i-1];
    order[available.remove(index)]=word.charAt(i);
   }
   out.append("Case ").append(tc).append(": ").append(order).append('\n');
  }
  System.out.print(out);
 }
}
