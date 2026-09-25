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
   String s=fs.next();int n=s.length(),i=0,j=1,k=0;
   while(i<n&&j<n&&k<n){
    char a=s.charAt((i+k)%n),b=s.charAt((j+k)%n);
    if(a==b){k++;continue;}
    if(a>b){i+=k+1;if(i==j)i++;}
    else{j+=k+1;if(i==j)j++;}
    k=0;
   }
   out.append(Math.min(i,j)+1).append('\n');
  }
  System.out.print(out);
 }
}
