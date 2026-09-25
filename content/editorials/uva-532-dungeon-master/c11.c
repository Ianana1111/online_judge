#include <stdio.h>
#define MAX 27000
static char grid[MAX];static int distance[MAX],queue[MAX];
int main(void){
 int levels,rows,cols;
 while(scanf("%d %d %d",&levels,&rows,&cols)==3&&levels){
  int cells=levels*rows*cols,start=-1,finish=-1;char line[32];
  for(int z=0;z<levels;z++)for(int y=0;y<rows;y++){
   scanf("%31s",line);
   for(int x=0;x<cols;x++){
    int id=(z*rows+y)*cols+x;grid[id]=line[x];distance[id]=-1;
    if(line[x]=='S')start=id;if(line[x]=='E')finish=id;
   }
  }
  int front=0,back=0;queue[back++]=start;distance[start]=0;
  const int dz[]={1,-1,0,0,0,0},dy[]={0,0,1,-1,0,0},dx[]={0,0,0,0,1,-1};
  while(front<back){
   int id=queue[front++],x=id%cols,y=id/cols%rows,z=id/(cols*rows);
   for(int d=0;d<6;d++){
    int nz=z+dz[d],ny=y+dy[d],nx=x+dx[d];
    if(nz<0||nz>=levels||ny<0||ny>=rows||nx<0||nx>=cols)continue;
    int next=(nz*rows+ny)*cols+nx;
    if(grid[next]=='#'||distance[next]!=-1)continue;
    distance[next]=distance[id]+1;queue[back++]=next;
   }
  }
  if(distance[finish]<0)puts("Trapped!");else printf("Escaped in %d minute(s).\n",distance[finish]);
 }
 return 0;
}
