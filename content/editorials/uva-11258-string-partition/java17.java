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
   String digits=fs.next();int n=digits.length();long[]best=new long[n+1];
   for(int i=n-1;i>=0;i--){
    if(digits.charAt(i)=='0'){best[i]=best[i+1];continue;}
    long value=0;
    for(int j=i;j<n&&j<i+10;j++){
     value=value*10+digits.charAt(j)-'0';if(value>2147483647L)break;
     best[i]=Math.max(best[i],value+best[j+1]);
    }
   }
   out.append(best[0]).append('\n');
  }
  System.out.print(out);
 }
}
