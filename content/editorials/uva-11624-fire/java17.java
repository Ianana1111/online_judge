import java.io.*;
import java.util.*;
public class Main{
 static class Scanner{
  BufferedReader reader=new BufferedReader(new InputStreamReader(System.in));
  StringTokenizer tokens=new StringTokenizer("");
  String next()throws IOException{while(!tokens.hasMoreTokens()){
   String line=reader.readLine();if(line==null)return null;tokens=new StringTokenizer(line);
  }return tokens.nextToken();}
  int nextInt()throws IOException{return Integer.parseInt(next());}
 }
 public static void main(String[]args)throws Exception{
  Scanner fs=new Scanner();int tests=fs.nextInt();StringBuilder out=new StringBuilder();
  int[]dy={1,-1,0,0},dx={0,0,1,-1};
  while(tests-->0){
   int rows=fs.nextInt(),cols=fs.nextInt(),cells=rows*cols;
   byte[]grid=new byte[cells];int[]fire=new int[cells],queue=new int[cells];
   Arrays.fill(fire,Integer.MAX_VALUE);
   int front=0,back=0,start=-1;
   for(int y=0;y<rows;y++){
    String line=fs.next();
    for(int x=0;x<cols;x++){
     int id=y*cols+x;char ch=line.charAt(x);grid[id]=(byte)ch;
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
