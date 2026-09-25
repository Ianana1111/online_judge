#include <stdio.h>
static char grid[10][11];static int parent[100],queue[100];
int main(void){
 for(int r=0;r<10;r++)if(scanf("%10s",grid[r])!=1)return 0;
 int start=-1,goal=-1;
 for(int r=0;r<10;r++)for(int c=0;c<10;c++){if(grid[r][c]=='S')start=10*r+c;if(grid[r][c]=='G')goal=10*r+c;}
 for(int i=0;i<100;i++)parent[i]=-1;
 int head=0,tail=0;queue[tail++]=start;parent[start]=start;
 int dr[4]={-1,0,1,0},dc[4]={0,1,0,-1};
 while(head<tail){int u=queue[head++];
  for(int d=0;d<4;d++){int r=u/10+dr[d],c=u%10+dc[d];
   if(r<0||r>=10||c<0||c>=10||grid[r][c]=='#')continue;
   int v=10*r+c;if(parent[v]>=0)continue;parent[v]=u;queue[tail++]=v;
  }
 }
 if(parent[goal]<0){puts("No solution\n");return 0;}
 for(int at=goal;;at=parent[at]){grid[at/10][at%10]='+';if(at==start)break;}
 for(int r=0;r<10;r++)puts(grid[r]);putchar('\n');return 0;
}
