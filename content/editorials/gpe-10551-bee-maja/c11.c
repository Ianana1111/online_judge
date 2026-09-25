#include <stdio.h>
static int xs[100000],ys[100000];
int main(void){
 const int dx[6]={-1,-1,0,1,1,0},dy[6]={1,0,-1,-1,0,1};
 int label=1,x=0,y=0;
 for(int ring=1;label<99999;ring++){
  y++;label++;if(label<=99999){xs[label]=x;ys[label]=y;}
  for(int d=0;d<6;d++)for(int j=0;j<(d==0?ring-1:ring);j++){
   x+=dx[d];y+=dy[d];label++;if(label<=99999){xs[label]=x;ys[label]=y;}
  }
 }
 int n;while(scanf("%d",&n)==1)printf("%d %d\n",xs[n],ys[n]);
 return 0;
}
