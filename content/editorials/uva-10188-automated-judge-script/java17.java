import java.io.*;
import java.util.*;
public class Main{
 static class Lines{
  InputStream in=System.in;
  byte[] next()throws IOException{
   ByteArrayOutputStream out=new ByteArrayOutputStream();int c;
   while((c=in.read())>=0&&c!='\n')out.write(c);
   if(c<0&&out.size()==0)return null;
   byte[]line=out.toByteArray();
   if(line.length>0&&line[line.length-1]=='\r')return Arrays.copyOf(line,line.length-1);
   return line;
  }
 }
 static boolean space(int c){return c==32||c==9||c==10||c==13||c==11||c==12;}
 static byte[] visible(byte[][]lines)throws IOException{
  ByteArrayOutputStream out=new ByteArrayOutputStream();
  for(byte[]line:lines)for(byte ch:line)if(!space(ch&255))out.write(ch);
  return out.toByteArray();
 }
 public static void main(String[]args)throws Exception{
  Lines fs=new Lines();byte[]line;StringBuilder out=new StringBuilder();int run=0;
  while((line=fs.next())!=null){
   if(line.length==0)continue;
   int n=Integer.parseInt(new String(line).trim());if(n==0)break;
   byte[][]standard=new byte[n][];int characters=0;
   for(int i=0;i<n;i++){standard[i]=fs.next();characters+=standard[i].length;}
   int m=Integer.parseInt(new String(fs.next()).trim());byte[][]team=new byte[m][];
   for(int i=0;i<m;i++)team[i]=fs.next();
   boolean exact=n==m;
   if(exact)for(int i=0;i<n;i++)if(!Arrays.equals(standard[i],team[i])){exact=false;break;}
   String verdict;
   if(exact)verdict="Accepted";
   else if(Arrays.equals(visible(standard),visible(team)))verdict="Presentation Error";
   else verdict="Wrong Answer";
   out.append("Run #").append(++run).append(": ").append(verdict).append(' ').append(characters).append('\n');
  }
  System.out.print(out);
 }
}
