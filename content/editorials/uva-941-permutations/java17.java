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
  while(tests-->0){
   String word=fs.next();long rank=Long.parseLong(fs.next());int[]count=new int[26];
   for(int i=0;i<word.length();i++)count[word.charAt(i)-'a']++;
   for(int remaining=word.length();remaining>0;remaining--){
    for(int ch=0;ch<26;ch++)if(count[ch]>0){
     count[ch]--;long ways=factorial[remaining-1];
     for(int frequency:count)ways/=factorial[frequency];
     if(rank<ways){out.append((char)('a'+ch));break;}
     rank-=ways;count[ch]++;
    }
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
