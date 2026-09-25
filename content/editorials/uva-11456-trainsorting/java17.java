import java.io.BufferedInputStream;
import java.io.IOException;
import java.util.Arrays;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 static final class Car {String value;int index;Car(String value,int index){this.value=value;this.index=index;}}
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  while(tests-->0){
   int n=fs.nextInt();Car[] cars=new Car[n];
   for(int i=0;i<n;i++){String value=fs.next().replaceFirst("^0+","");cars[i]=new Car(value.isEmpty()?"0":value,i);}
   Arrays.sort(cars,(a,b)->{int difference=Integer.compare(a.value.length(),b.value.length());return difference!=0?difference:a.value.compareTo(b.value);});
   int[] weight=new int[n],rise=new int[n],fall=new int[n];
   for(int rank=0;rank<n;rank++)weight[cars[rank].index]=rank;
   int answer=0;
   for(int i=n-1;i>=0;i--){rise[i]=fall[i]=1;
    for(int j=i+1;j<n;j++){
     if(weight[j]>weight[i])rise[i]=Math.max(rise[i],rise[j]+1);
     if(weight[j]<weight[i])fall[i]=Math.max(fall[i],fall[j]+1);
    }
    answer=Math.max(answer,rise[i]+fall[i]-1);
   }
   out.append(answer).append('\n');
  }
  System.out.print(out);
 }
}
