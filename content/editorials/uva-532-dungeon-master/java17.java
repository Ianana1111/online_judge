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
  Scanner fs=new Scanner();StringBuilder out=new StringBuilder();int levels;
  while((levels=fs.nextInt())>0){
   int rows=fs.nextInt(),cols=fs.nextInt(),cells=levels*rows*cols;
   char[]grid=new char[cells];int[]distance=new int[cells],queue=new int[cells];
   Arrays.fill(distance,-1);int start=-1,finish=-1;
   for(int z=0;z<levels;z++)for(int y=0;y<rows;y++){
    String line=fs.next();
    for(int x=0;x<cols;x++){
     int id=(z*rows+y)*cols+x;char ch=line.charAt(x);grid[id]=ch;
     if(ch=='S')start=id;if(ch=='E')finish=id;
    }
   }
   int[]dz={1,-1,0,0,0,0},dy={0,0,1,-1,0,0},dx={0,0,0,0,1,-1};
   int front=0,back=0;queue[back++]=start;distance[start]=0;
   while(front<back){
    int id=queue[front++],x=id%cols,y=id/cols%rows,z=id/(cols*rows);
    for(int d=0;d<6;d++){
     int nz=z+dz[d],ny=y+dy[d],nx=x+dx[d];
     if(nz<0||nz>=levels||ny<0||ny>=rows||nx<0||nx>=cols)continue;
     int next=(nz*rows+ny)*cols+nx;
     if(grid[next]=='#'||distance[next]>=0)continue;
     distance[next]=distance[id]+1;queue[back++]=next;
    }
   }
   if(distance[finish]<0)out.append("Trapped!\n");
   else out.append("Escaped in ").append(distance[finish]).append(" minute(s).\n");
  }
  System.out.print(out);
 }
}
