import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  BufferedInputStream in=new BufferedInputStream(System.in);
  int character()throws IOException{int c;do{c=in.read();}while(c>=0&&c<=32);return c;}
  int nextInt()throws IOException{int c=character(),value=0;while(c>32){value=value*10+c-'0';c=in.read();}return value;}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  int[]dy={1,-1,0,0},dx={0,0,1,-1};
  byte[]grid=new byte[1000000];int[]fire=new int[1000000],queue=new int[1000000];
  while(tests-->0){
   int rows=fs.nextInt(),cols=fs.nextInt(),cells=rows*cols;
   Arrays.fill(fire,0,cells,Integer.MAX_VALUE);
   int front=0,back=0,start=-1;
   for(int y=0;y<rows;y++){
    for(int x=0;x<cols;x++){
     int id=y*cols+x;char ch=(char)fs.character();grid[id]=(byte)ch;
     if(ch=='F'){fire[id]=0;queue[back++]=id;}
     if(ch=='J')start=id;
    }
   }
   while(front<back){
    int id=queue[front++],y=id/cols,x=id%cols;
    for(int d=0;d<4;d++){
     int ny=y+dy[d],nx=x+dx[d];
     if(ny<0||ny>=rows||nx<0||nx>=cols)continue;
     int next=ny*cols+nx;
     if(grid[next]=='#'||fire[next]!=Integer.MAX_VALUE)continue;
     fire[next]=fire[id]+1;queue[back++]=next;
    }
   }
   front=0;back=1;queue[0]=start;grid[start]='V';int answer=-1,time=0;
   while(front<back&&answer<0){
    int layerEnd=back;
    while(front<layerEnd&&answer<0){
     int id=queue[front++],y=id/cols,x=id%cols;
     if(y==0||y==rows-1||x==0||x==cols-1){answer=time+1;break;}
     for(int d=0;d<4;d++){
      int ny=y+dy[d],nx=x+dx[d],next=ny*cols+nx;
      if(grid[next]=='#'||grid[next]=='V'||time+1>=fire[next])continue;
      grid[next]='V';queue[back++]=next;
     }
    }
    time++;
   }
   out.append(answer<0?"IMPOSSIBLE":Integer.toString(answer)).append('\n');
  }
  System.out.print(out);
 }
}
