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
  Scanner fs=new Scanner();String a;StringBuilder out=new StringBuilder();
  while((a=fs.next())!=null){
   String b=fs.next();int[]digits=new int[a.length()+b.length()];
   for(int i=a.length()-1;i>=0;i--)for(int j=b.length()-1;j>=0;j--)
    digits[i+j+1]+=(a.charAt(i)-'0')*(b.charAt(j)-'0');
   for(int i=digits.length-1;i>0;i--){digits[i-1]+=digits[i]/10;digits[i]%=10;}
   int first=0;while(first+1<digits.length&&digits[first]==0)first++;
   for(int i=first;i<digits.length;i++)out.append(digits[i]);out.append('\n');
  }
  System.out.print(out);
 }
}
