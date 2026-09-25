import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Locale;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();String city;StringBuilder out=new StringBuilder();
  while((city=fs.next())!=null){
   long[] start=new long[3],finish=new long[3],direction=new long[3];long a=0;
   for(int i=0;i<3;i++)start[i]=fs.nextInt();for(int i=0;i<3;i++)finish[i]=fs.nextInt();
   for(int i=0;i<3;i++){direction[i]=finish[i]-start[i];a+=direction[i]*direction[i];}
   int n=fs.nextInt();double fraction=0;
   for(int j=0;j<n;j++){
    long[] center=new long[3];for(int i=0;i<3;i++)center[i]=fs.nextInt();long radius=fs.nextInt(),b=0,c=-radius*radius;
    for(int i=0;i<3;i++){long offset=start[i]-center[i];b+=offset*direction[i];c+=offset*offset;}
    long discriminant=b*b-a*c;if(discriminant<=0)continue;
    double root=Math.sqrt(discriminant),enter=(-b-root)/a,leave=(-b+root)/a;
    fraction+=Math.max(0,Math.min(1,leave)-Math.max(0,enter));
   }
   out.append(city).append('\n').append(String.format(Locale.US,"%.2f",100*fraction)).append('\n');
  }
  System.out.print(out);
 }
}
