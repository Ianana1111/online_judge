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
 static boolean[][]black;
 static int paint(String tree,int position,int row,int col,int side){
  char kind=tree.charAt(position++);
  if(kind=='f'){
   for(int r=row;r<row+side;r++)for(int c=col;c<col+side;c++)black[r][c]=true;
  }else if(kind=='p'){
   int half=side/2;
   position=paint(tree,position,row,col+half,half);
   position=paint(tree,position,row,col,half);
   position=paint(tree,position,row+half,col,half);
   position=paint(tree,position,row+half,col+half,half);
  }
  return position;
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder();
  while(tests-->0){
   String first=fs.next(),second=fs.next();black=new boolean[32][32];
   paint(first,0,0,0,32);paint(second,0,0,0,32);
   int count=0;for(boolean[]row:black)for(boolean pixel:row)if(pixel)count++;
   out.append("There are ").append(count).append(" black pixels.\n");
  }
  System.out.print(out);
 }
}
