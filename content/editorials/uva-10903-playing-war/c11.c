#include <stdio.h>
#include <string.h>
static int wins[100],losses[100];
int main(void){
 int n,k,first=1;
 while(scanf("%d",&n)==1&&n){
  scanf("%d",&k);for(int i=0;i<n;i++)wins[i]=losses[i]=0;
  int games=k*n*(n-1)/2;
  for(int i=0;i<games;i++){
   int a,b;char x[12],y[12];scanf("%d %11s %d %11s",&a,x,&b,y);a--;b--;
   if(strcmp(x,y)==0)continue;
   int win=(!strcmp(x,"rock")&&!strcmp(y,"scissors"))||
    (!strcmp(x,"scissors")&&!strcmp(y,"paper"))||
    (!strcmp(x,"paper")&&!strcmp(y,"rock"));
   if(win){wins[a]++;losses[b]++;}else{wins[b]++;losses[a]++;}
  }
  if(!first)putchar('\n');first=0;
  for(int i=0;i<n;i++){
   int played=wins[i]+losses[i];
   if(!played)puts("-");
   else{int value=(2000*wins[i]+played)/(2*played);printf("%d.%03d\n",value/1000,value%1000);}
  }
 }
 return 0;
}
