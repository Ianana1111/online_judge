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
   int k=Integer.parseInt(fs.next());String[]first=new String[6],second=new String[6];
   for(int i=0;i<6;i++)first[i]=fs.next();for(int i=0;i<6;i++)second[i]=fs.next();
   StringBuilder[]choices=new StringBuilder[5];int[]suffix=new int[6];suffix[5]=1;
   for(int col=0;col<5;col++){
    boolean[]a=new boolean[26],b=new boolean[26];
    for(int row=0;row<6;row++){a[first[row].charAt(col)-'A']=true;b[second[row].charAt(col)-'A']=true;}
    choices[col]=new StringBuilder();
    for(int c=0;c<26;c++)if(a[c]&&b[c])choices[col].append((char)('A'+c));
   }
   for(int col=4;col>=0;col--)suffix[col]=suffix[col+1]*choices[col].length();
   if(k>suffix[0]){out.append("NO\n");continue;}
   int rank=k-1;
   for(int col=0;col<5;col++){
    int block=suffix[col+1];out.append(choices[col].charAt(rank/block));rank%=block;
   }
   out.append('\n');
  }
  System.out.print(out);
 }
}
