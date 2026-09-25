import java.io.*;
public class Main{
 public static void main(String[]args)throws Exception{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  String line=reader.readLine();if(line==null)return;int tests=Integer.parseInt(line.trim());
  StringBuilder out=new StringBuilder();
  for(int tc=0;tc<tests;tc++){
   String plain;
   do{plain=reader.readLine();if(plain==null)return;}while(plain.isEmpty());
   String sub=reader.readLine();char[]map=new char[Character.MAX_VALUE+1];
   for(int i=0;i<map.length;i++)map[i]=(char)i;
   for(int i=0;i<plain.length();i++)map[plain.charAt(i)]=sub.charAt(i);
   if(tc>0)out.append('\n');out.append(sub).append('\n').append(plain).append('\n');
   while((line=reader.readLine())!=null&&!line.isEmpty()){
    for(int i=0;i<line.length();i++)out.append(map[line.charAt(i)]);
    out.append('\n');
   }
  }
  System.out.print(out);
 }
}
