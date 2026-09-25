import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  InputStream in=System.in;byte[] b=new byte[65536];int p=0,n=0;
  int read()throws IOException{if(p>=n){n=in.read(b);p=0;if(n<0)return -1;}return b[p++];}
  int nextInt()throws IOException{int c;do{c=read();}while(c<=32&&c>=0);if(c<0)return -1;
   int x=0;while(c>32&&c>=0){x=x*10+c-'0';c=read();}return x;}
 }
 static class Elephant{int weight,iq,id;Elephant(int w,int q,int id){weight=w;iq=q;this.id=id;}}
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();ArrayList<Elephant> animals=new ArrayList<>();int weight;
  while((weight=fs.nextInt())>=0)animals.add(new Elephant(weight,fs.nextInt(),animals.size()+1));
  animals.sort((a,b)->a.weight!=b.weight?Integer.compare(a.weight,b.weight):
   a.iq!=b.iq?Integer.compare(b.iq,a.iq):Integer.compare(a.id,b.id));
  int n=animals.size(),last=-1;int[] length=new int[n],previous=new int[n];
  Arrays.fill(length,1);Arrays.fill(previous,-1);
  for(int i=0;i<n;i++){
   for(int j=0;j<i;j++)if(animals.get(j).weight<animals.get(i).weight&&animals.get(j).iq>animals.get(i).iq&&length[j]+1>length[i]){
    length[i]=length[j]+1;previous[i]=j;
   }
   if(last<0||length[i]>length[last])last=i;
  }
  ArrayList<Integer> path=new ArrayList<>();for(int i=last;i>=0;i=previous[i])path.add(animals.get(i).id);
  StringBuilder out=new StringBuilder();out.append(path.size()).append('\n');
  for(int i=path.size()-1;i>=0;i--)out.append(path.get(i)).append('\n');
  System.out.print(out);
 }
}
