import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);int sign=1;
   if(c=='-'){sign=-1;c=read();}int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x*sign;}
 }
 static class Segment{int left,right;Segment(int a,int b){left=a;right=b;}}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  for(int tc=0;tc<tests;tc++){
   int target=fs.nextInt();ArrayList<Segment> segments=new ArrayList<>();
   while(true){int left=fs.nextInt(),right=fs.nextInt();
    if(left==0&&right==0)break;segments.add(new Segment(left,right));}
   segments.sort((a,b)->a.left!=b.left?Integer.compare(a.left,b.left):Integer.compare(a.right,b.right));
   ArrayList<Segment> answer=new ArrayList<>();int covered=0,at=0;
   while(covered<target){
    int farthest=covered;Segment chosen=null;
    while(at<segments.size()&&segments.get(at).left<=covered){
     Segment current=segments.get(at++);
     if(current.right>farthest){farthest=current.right;chosen=current;}
    }
    if(chosen==null){answer.clear();break;}
    answer.add(chosen);covered=farthest;
   }
   if(tc>0)out.append('\n');out.append(answer.size()).append('\n');
   for(Segment segment:answer)out.append(segment.left).append(' ').append(segment.right).append('\n');
  }
  System.out.print(out);
 }
}
