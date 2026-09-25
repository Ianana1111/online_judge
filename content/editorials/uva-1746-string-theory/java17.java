import java.io.BufferedInputStream;
import java.io.IOException;
public class Main {
 static final class FastScanner {
  private final BufferedInputStream in=new BufferedInputStream(System.in);
  private final byte[] buffer=new byte[1<<16];private int at=0,size=0;
  int read()throws IOException{if(at>=size){size=in.read(buffer);at=0;if(size<0)return -1;}return buffer[at++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=read();}return value;}
 }
 static boolean valid(int[] original,int level){
  int[] runs=original.clone();int quotes=0;for(int value:runs)quotes+=value;
  if(quotes%2!=0)return false;if(level==1)return quotes==2;
  int left=0,right=runs.length-1;
  for(int layer=level;layer>=2;layer--){
   while(left<=right&&runs[left]==0)left++;
   while(left<=right&&runs[right]==0)right--;
   if(left>right||runs[left]<layer||runs[right]<layer)return false;
   if(left==right&&runs[left]<2*layer)return false;
   runs[left]-=layer;runs[right]-=layer;quotes-=2*layer;
  }
  return quotes>=2;
 }
 public static void main(String[] args)throws Exception{
  FastScanner fs=new FastScanner();StringBuilder out=new StringBuilder();int n;
  while((n=fs.nextInt())>=0){int[] runs=new int[n];int total=0;
   for(int i=0;i<n;i++){runs[i]=fs.nextInt();total+=runs[i];}
   int answer=0;
   for(int k=Math.min(runs[0],runs[n-1]);k>=1;k--)if(k*(k+1)<=total&&valid(runs,k)){answer=k;break;}
   out.append(answer==0?"no quotation":Integer.toString(answer)).append('\n');
  }
  System.out.print(out);
 }
}
