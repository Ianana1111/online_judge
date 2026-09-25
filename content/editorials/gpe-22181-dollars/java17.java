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
  int[]coins={1,2,4,10,20,40,100,200,400,1000,2000};long[]ways=new long[6001];ways[0]=1;
  for(int coin:coins)for(int total=coin;total<=6000;total++)ways[total]+=ways[total-coin];
  Scanner fs=new Scanner();String token;StringBuilder out=new StringBuilder();
  while((token=fs.next())!=null){
   int dot=token.indexOf('.');String whole=dot<0?token:token.substring(0,dot);
   String fraction=dot<0?"":token.substring(dot+1);fraction+="00";
   int cents=(whole.isEmpty()?0:Integer.parseInt(whole))*100+(fraction.charAt(0)-'0')*10+fraction.charAt(1)-'0';
   if(cents==0)break;
   String amount=(cents/100)+"."+String.format(Locale.US,"%02d",cents%100);
   out.append(String.format(Locale.US,"%6s%17d%n",amount,ways[cents/5]));
  }
  System.out.print(out);
 }
}
