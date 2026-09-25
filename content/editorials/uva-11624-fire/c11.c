#include <limits.h>
#include <stdio.h>
#define MAX 1000000
static char grid[MAX];static int fire[MAX],distance[MAX],queue[MAX];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int rows,cols;scanf("%d %d",&rows,&cols);
  int front=0,back=0,start=-1;char line[1002];
  for(int y=0;y<rows;y++){
   scanf("%1001s",line);
   for(int x=0;x<cols;x++){
    int id=y*cols+x;grid[id]=line[x];fire[id]=INT_MAX;distance[id]=-1;
    if(line[x]=='F'){fire[id]=0;queue[back++]=id;}
    if(line[x]=='J')start=id;
   }
  }
  const int dy[]={1,-1,0,0},dx[]={0,0,1,-1};
  while(front<back){
   int id=queue[front++],y=id/cols,x=id%cols;
   for(int d=0;d<4;d++){
    int ny=y+dy[d],nx=x+dx[d];
    if(ny<0||ny>=rows||nx<0||nx>=cols)continue;
    int next=ny*cols+nx;
    if(grid[next]=='#'||fire[next]!=INT_MAX)continue;
    fire[next]=fire[id]+1;queue[back++]=next;
   }
  }
  front=back=0;queue[back++]=start;distance[start]=0;int answer=-1;
  while(front<back&&answer<0){
   int id=queue[front++],y=id/cols,x=id%cols;
   if(y==0||y==rows-1||x==0||x==cols-1){answer=distance[id]+1;break;}
   for(int d=0;d<4;d++){
    int ny=y+dy[d],nx=x+dx[d],next=ny*cols+nx;
    if(grid[next]=='#'||distance[next]>=0)continue;
    int arrival=distance[id]+1;
    if(arrival>=fire[next])continue;
    distance[next]=arrival;queue[back++]=next;
   }
  }
  if(answer<0)puts("IMPOSSIBLE");else printf("%d\n",answer);
 }
 return 0;
}
