import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  String next()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return null;StringBuilder word=new StringBuilder();while(c>32){word.append((char)c);c=read();}return word.toString();}
 }
 static boolean possible(String y,String x,int bound){
  int m=y.length();int[] previous=new int[m+1],current=new int[m+1];
  for(int j=0;j<=m;j++)previous[j]=j;boolean finished=false;
  for(int i=0;i<x.length();i++){
   current[0]=previous[0]+1;
   for(int j=1;j<=m;j++){
    int a=previous[j]+1,b=current[j-1]+1,c=previous[j-1]+(x.charAt(i)==y.charAt(j-1)?0:1);
    current[j]=Math.min(Math.min(a,b),c);
   }
   finished=current[m]<=bound;
   if(finished)for(int j=0;j<=m;j++)current[j]=Math.min(current[j],j);
   int[] temp=previous;previous=current;current=temp;
  }
  return finished;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();int tests=Integer.parseInt(fs.next());StringBuilder out=new StringBuilder();
  while(tests-->0){String y=fs.next(),x=fs.next();int low=0,high=y.length();
   while(low<high){int mid=(low+high)/2;if(possible(y,x,mid))high=mid;else low=mid+1;}
   out.append(low).append('\n');
  }
  System.out.print(out);
 }
}
