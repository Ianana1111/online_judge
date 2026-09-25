import java.io.BufferedReader;
import java.io.InputStreamReader;
public class Main {
 static int[] date(String text){String[] parts=text.split("/");return new int[]{Integer.parseInt(parts[0]),Integer.parseInt(parts[1]),Integer.parseInt(parts[2])};}
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
  int cases=Integer.parseInt(input.readLine().trim());StringBuilder out=new StringBuilder();
  for(int t=1;t<=cases;t++){
   String line;do{line=input.readLine();}while(line!=null&&line.trim().isEmpty());
   int[] current=date(line.trim());
   do{line=input.readLine();}while(line!=null&&line.trim().isEmpty());
   int[] birth=date(line.trim());
   int cd=current[0],cm=current[1],cy=current[2],bd=birth[0],bm=birth[1],by=birth[2];
   out.append("Case #").append(t).append(": ");
   if(by>cy||(by==cy&&(bm>cm||(bm==cm&&bd>cd))))out.append("Invalid birth date");
   else{int age=cy-by-((cm<bm||(cm==bm&&cd<bd))?1:0);out.append(age>130?"Check birth date":Integer.toString(age));}
   out.append('\n');
  }
  System.out.print(out);
 }
}
