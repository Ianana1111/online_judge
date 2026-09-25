import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Locale;
public class Main {
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
  int tests=Integer.parseInt(input.readLine().trim());StringBuilder out=new StringBuilder();
  for(int t=0;t<tests;t++){
   String line;do{line=input.readLine();}while(line!=null&&line.trim().isEmpty());
   double distance=0;
   while((line=input.readLine())!=null&&!line.trim().isEmpty()){
    String[] part=line.trim().split("\\s+");
    double x1=Double.parseDouble(part[0]),y1=Double.parseDouble(part[1]);
    double x2=Double.parseDouble(part[2]),y2=Double.parseDouble(part[3]);
    distance+=Math.hypot(x2-x1,y2-y1);
   }
   long minutes=(long)Math.floor(distance*6/1000+0.5);
   if(t>0)out.append('\n');
   out.append(minutes/60).append(':');if(minutes%60<10)out.append('0');out.append(minutes%60).append('\n');
  }
  System.out.print(out);
 }
}
