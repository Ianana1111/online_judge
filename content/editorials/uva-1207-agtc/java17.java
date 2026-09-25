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
  Scanner fs=new Scanner();String first;StringBuilder out=new StringBuilder();
  while((first=fs.next())!=null){
   int m=Integer.parseInt(first);String x=m>0?fs.next():"";
   int n=Integer.parseInt(fs.next());String y=n>0?fs.next():"";
   int[]previous=new int[n+1],current=new int[n+1];
   for(int j=0;j<=n;j++)previous[j]=j;
   for(int i=1;i<=m;i++){
    current[0]=i;
    for(int j=1;j<=n;j++)current[j]=Math.min(Math.min(previous[j]+1,current[j-1]+1),previous[j-1]+(x.charAt(i-1)==y.charAt(j-1)?0:1));
    int[]tmp=previous;previous=current;current=tmp;
   }
   out.append(previous[n]).append('\n');
  }
  System.out.print(out);
 }
}
