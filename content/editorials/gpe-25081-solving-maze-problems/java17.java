import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
public class Main {
 public static void main(String[] args)throws Exception{
  BufferedReader input=new BufferedReader(new InputStreamReader(System.in));char[][] grid=new char[10][];
  for(int r=0;r<10;r++){String line=input.readLine();if(line==null)return;grid[r]=line.trim().toCharArray();}
  int start=-1,goal=-1;
  for(int r=0;r<10;r++)for(int c=0;c<10;c++){if(grid[r][c]=='S')start=10*r+c;if(grid[r][c]=='G')goal=10*r+c;}
  int[] parent=new int[100],queue=new int[100];Arrays.fill(parent,-1);
  int head=0,tail=0;queue[tail++]=start;parent[start]=start;
  int[] dr={-1,0,1,0},dc={0,1,0,-1};
  while(head<tail){int u=queue[head++];
   for(int d=0;d<4;d++){int r=u/10+dr[d],c=u%10+dc[d];
    if(r<0||r>=10||c<0||c>=10||grid[r][c]=='#')continue;
    int v=10*r+c;if(parent[v]>=0)continue;parent[v]=u;queue[tail++]=v;
   }
  }
  if(parent[goal]<0){System.out.print("No solution\n\n");return;}
  for(int at=goal;;at=parent[at]){grid[at/10][at%10]='+';if(at==start)break;}
  StringBuilder out=new StringBuilder();for(char[] row:grid)out.append(row).append('\n');out.append('\n');System.out.print(out);
 }
}
