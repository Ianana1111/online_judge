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
   String s=fs.next();int n=s.length();boolean[][]palindrome=new boolean[n][n];
   for(int left=n-1;left>=0;left--)for(int right=left;right<n;right++)
    palindrome[left][right]=s.charAt(left)==s.charAt(right)&&(right-left<2||palindrome[left+1][right-1]);
   int[]groups=new int[n+1];Arrays.fill(groups,n+1);groups[0]=0;
   for(int end=1;end<=n;end++)for(int begin=0;begin<end;begin++)
    if(palindrome[begin][end-1])groups[end]=Math.min(groups[end],groups[begin]+1);
   out.append(groups[n]).append('\n');
  }
  System.out.print(out);
 }
}
