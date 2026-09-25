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
  final int mod=1000007;
  for(int tc=1;tc<=tests;tc++){
   int n=Integer.parseInt(fs.next());char[][]board=new char[n][];int[][]ways=new int[n][n];
   for(int r=0;r<n;r++){
    board[r]=fs.next().toCharArray();
    for(int c=0;c<n;c++)if(board[r][c]=='W')ways[r][c]=1;
   }
   for(int r=n-1;r>0;r--)for(int c=0;c<n;c++)if(ways[r][c]>0){
    for(int direction=-1;direction<=1;direction+=2){
     int nr=r-1,nc=c+direction;if(nc<0||nc>=n)continue;
     if(board[nr][nc]=='B'){nr--;nc+=direction;}
     if(nr<0||nc<0||nc>=n||board[nr][nc]=='B')continue;
     ways[nr][nc]=(ways[nr][nc]+ways[r][c])%mod;
    }
   }
   int answer=0;for(int c=0;c<n;c++)answer=(answer+ways[0][c])%mod;
   out.append("Case ").append(tc).append(": ").append(answer).append('\n');
  }
  System.out.print(out);
 }
}
