#include <stdio.h>
#define MOD 1000007
static char board[100][101];static int ways[100][100];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n;scanf("%d",&n);
  for(int r=0;r<n;r++){
   scanf("%100s",board[r]);
   for(int c=0;c<n;c++)ways[r][c]=board[r][c]=='W';
  }
  for(int r=n-1;r>0;r--)for(int c=0;c<n;c++)if(ways[r][c]){
   for(int d=-1;d<=1;d+=2){
    int nr=r-1,nc=c+d;
    if(nc<0||nc>=n)continue;
    if(board[nr][nc]=='B'){nr--;nc+=d;}
    if(nr<0||nc<0||nc>=n||board[nr][nc]=='B')continue;
    ways[nr][nc]=(ways[nr][nc]+ways[r][c])%MOD;
   }
  }
  int answer=0;for(int c=0;c<n;c++)answer=(answer+ways[0][c])%MOD;
  printf("Case %d: %d\n",tc,answer);
 }
 return 0;
}
