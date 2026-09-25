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
   String word=fs.next();int n=word.length();int[][]next=new int[n+1][26];
   Arrays.fill(next[n],n);
   for(int i=n-1;i>=0;i--){
    System.arraycopy(next[i+1],0,next[i],0,26);next[i][word.charAt(i)-'A']=i;
   }
   int answer=0;
   for(int a=0;a<26;a++){
    int first=next[0][a];if(first==n)continue;
    for(int b=0;b<26;b++){
     int second=next[first+1][b];if(second==n)continue;
     for(int c=0;c<26;c++)if(next[second+1][c]<n)answer++;
    }
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
