#include <stdio.h>
#include <string.h>
static char graph[202][201];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int t=1;t<=tests;t++){
  char trend[201];scanf("%200s",trend);int n=(int)strlen(trend),height=100,low=201,high=-1;
  for(int y=0;y<202;y++)for(int x=0;x<n;x++)graph[y][x]=' ';
  for(int x=0;x<n;x++){
   char ch=trend[x];if(ch=='F')height--;
   graph[height][x]=ch=='R'?'/':ch=='F'?'\\':'_';
   if(height<low)low=height;if(height>high)high=height;
   if(ch=='R')height++;
  }
  printf("Case #%d:\n",t);
  for(int y=high;y>=low;y--){int end=n;while(end>0&&graph[y][end-1]==' ')end--;
   printf("| ");for(int x=0;x<end;x++)putchar(graph[y][x]);putchar('\n');
  }
  putchar('+');for(int x=0;x<n+2;x++)putchar('-');printf("\n\n");
 }
 return 0;
}
