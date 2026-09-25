#include <stdio.h>
#include <string.h>
static char seen[100][2501];
static void canonical(const char *board,int n,char *best){
 char current[2501],next[2501];int cells=n*n;
 memcpy(current,board,(size_t)cells);current[cells]=0;memcpy(best,current,(size_t)cells+1);
 for(int turn=0;turn<4;turn++){
  if(strcmp(current,best)<0)strcpy(best,current);
  for(int r=0;r<n;r++)for(int c=0;c<n;c++)next[c*n+n-1-r]=current[r*n+c];
  next[cells]=0;strcpy(current,next);
 }
}
int main(void){
 int n;while(scanf("%d",&n)==1&&n){
  char board[2501],key[2501];memset(board,'0',(size_t)n*n);board[n*n]=0;
  int count=0,winner=0,losing=0;
  for(int step=1;step<=2*n;step++){
   int r,c;char op;scanf("%d %d %c",&r,&c,&op);board[(r-1)*n+c-1]=op=='+'?'1':'0';
   if(winner)continue;canonical(board,n,key);
   for(int i=0;i<count;i++)if(strcmp(seen[i],key)==0){winner=step%2?2:1;losing=step;break;}
   strcpy(seen[count++],key);
  }
  if(winner)printf("Player %d wins on move %d\n",winner,losing);else puts("Draw");
 }
 return 0;
}
