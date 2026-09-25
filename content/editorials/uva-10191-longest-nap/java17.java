import java.io.*;
import java.util.*;
public class Main{
 static int minutes(String token){return Integer.parseInt(token.substring(0,2))*60+Integer.parseInt(token.substring(3,5));}
 public static void main(String[]args)throws Exception{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  String line;StringBuilder out=new StringBuilder();int day=0;
  while((line=reader.readLine())!=null){
   if(line.trim().isEmpty())continue;int n=Integer.parseInt(line.trim());
   int[][]times=new int[n+1][2];
   for(int i=0;i<n;i++){
    String[]parts=reader.readLine().split("\\s+",3);
    times[i][0]=minutes(parts[0]);times[i][1]=minutes(parts[1]);
   }
   times[n][0]=times[n][1]=1080;Arrays.sort(times,Comparator.comparingInt(a->a[0]));
   int cursor=600,bestStart=600,longest=0;
   for(int[]appointment:times){
    int gap=appointment[0]-cursor;
    if(gap>longest){longest=gap;bestStart=cursor;}
    cursor=Math.max(cursor,appointment[1]);
   }
   out.append("Day #").append(++day).append(": the longest nap starts at ")
    .append(String.format(Locale.US,"%02d:%02d",bestStart/60,bestStart%60))
    .append(" and will last for ");
   if(longest>=60)out.append(longest/60).append(" hours and ");
   out.append(longest%60).append(" minutes.\n");
  }
  System.out.print(out);
 }
}
