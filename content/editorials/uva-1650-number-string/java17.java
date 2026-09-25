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
  Scanner fs=new Scanner();String signature;StringBuilder out=new StringBuilder();
  final long mod=1000000007L;
  while((signature=fs.next())!=null){
   long[]previous={1};
   for(int i=0;i<signature.length();i++){
    int size=previous.length;long[]prefix=new long[size+1],current=new long[size+1];
    for(int j=0;j<size;j++)prefix[j+1]=(prefix[j]+previous[j])%mod;
    for(int j=0;j<=size;j++){
     char relation=signature.charAt(i);
     if(relation=='I')current[j]=prefix[j];
     else if(relation=='D')current[j]=(prefix[size]-prefix[j]+mod)%mod;
     else current[j]=prefix[size];
    }
    previous=current;
   }
   long answer=0;for(long value:previous)answer=(answer+value)%mod;
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
