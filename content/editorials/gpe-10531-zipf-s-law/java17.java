import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.TreeMap;
public class Main {
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));String line;StringBuilder out=new StringBuilder();boolean first=true;
  while((line=input.readLine())!=null){
   line=line.trim();if(line.isEmpty())continue;
   String frequency=line.split("\\s+")[0];int target=0;
   for(int i=0;i<frequency.length();i++)target=Math.min(10001,target*10+frequency.charAt(i)-'0');
   TreeMap<String,Integer> count=new TreeMap<>();
   while((line=input.readLine())!=null&&!line.equals("EndOfText")){
    StringBuilder word=new StringBuilder();
    for(int i=0;i<=line.length();i++){
     char ch=i<line.length()?line.charAt(i):' ';
     boolean letter=(ch>='a'&&ch<='z')||(ch>='A'&&ch<='Z');
     if(letter)word.append(ch>='A'&&ch<='Z'?(char)(ch-'A'+'a'):ch);
     else if(word.length()>0){String key=word.toString();count.put(key,count.getOrDefault(key,0)+1);word.setLength(0);}
    }
   }
   if(!first)out.append('\n');first=false;boolean found=false;
   for(Map.Entry<String,Integer> entry:count.entrySet())if(entry.getValue()==target){out.append(entry.getKey()).append('\n');found=true;}
   if(!found)out.append("There is no such word.\n");
  }
  System.out.print(out);
 }
}
