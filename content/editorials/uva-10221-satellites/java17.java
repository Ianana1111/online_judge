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
   long height=Long.parseLong(first),angle=Long.parseLong(fs.next());String unit=fs.next();
   double degrees=angle;if(unit.equals("min"))degrees/=60.0;
   degrees%=360.0;if(degrees>180.0)degrees=360.0-degrees;
   double radius=6440.0+height,theta=Math.toRadians(degrees);
   out.append(String.format(Locale.US,"%.6f %.6f%n",radius*theta,2*radius*Math.sin(theta/2)));
  }
  System.out.print(out);
 }
}
