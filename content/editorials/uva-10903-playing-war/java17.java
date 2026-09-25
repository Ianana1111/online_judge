import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  StringTokenizer tokens=new StringTokenizer("");
  String next()throws IOException{while(!tokens.hasMoreTokens()){
   String line=reader.readLine();if(line==null)return null;tokens=new StringTokenizer(line);
  }return tokens.nextToken();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int n;boolean first=true;
  while((n=fs.nextInt())>0){
   int k=fs.nextInt();int[]wins=new int[n],losses=new int[n];
   for(int game=0;game<k*n*(n-1)/2;game++){
    int a=fs.nextInt()-1;String x=fs.next();int b=fs.nextInt()-1;String y=fs.next();
    if(x.equals(y))continue;
    boolean win=(x.equals("rock")&&y.equals("scissors"))||
     (x.equals("scissors")&&y.equals("paper"))||(x.equals("paper")&&y.equals("rock"));
    if(win){wins[a]++;losses[b]++;}else{wins[b]++;losses[a]++;}
   }
   if(!first)out.append('\n');first=false;
   for(int i=0;i<n;i++){
    int played=wins[i]+losses[i];
    if(played==0)out.append("-\n");
    else{
     int value=(2*wins[i]*1000+played)/(2*played);
     out.append(value/1000).append('.').append(String.format(Locale.US,"%03d",value%1000)).append('\n');
    }
   }
  }
  System.out.print(out);
 }
}
