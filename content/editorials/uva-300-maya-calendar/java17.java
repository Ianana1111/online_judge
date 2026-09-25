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
  String[]months="pop no zip zotz tzec xul yoxkin mol chen yax zac ceh mac kankin muan pax koyab cumhu uayet".split(" ");
  String[]names="imix ik akbal kan chicchan cimi manik lamat muluk ok chuen eb ben ix mem cib caban eznab canac ahau".split(" ");
  Scanner fs=new Scanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder().append(tests).append('\n');
  for(int tc=0;tc<tests;tc++){
   String dayToken=fs.next();int day=Integer.parseInt(dayToken.substring(0,dayToken.length()-1));
   String month=fs.next();int year=Integer.parseInt(fs.next());int monthIndex=0;
   while(!months[monthIndex].equals(month))monthIndex++;
   int elapsed=year*365+monthIndex*20+day;
   out.append(elapsed%13+1).append(' ').append(names[elapsed%20]).append(' ').append(elapsed/260).append('\n');
  }
  System.out.print(out);
 }
}
