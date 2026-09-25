#include <stdio.h>
#include <string.h>
static unsigned long long row[300][5];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n,k;scanf("%d %d",&n,&k);memset(row,0,sizeof(row));
  while(k--){int u,v;scanf("%d %d",&u,&v);row[u][v/64]|=1ULL<<(v%64);}
  int valid=1;
  for(int u=0;u<n;u++)for(int v=u+1;v<n;v++){
   int common=0,equal=1;
   for(int part=0;part<5;part++){
    if(row[u][part]&row[v][part])common=1;
    if(row[u][part]!=row[v][part])equal=0;
   }
   if(common&&!equal)valid=0;
  }
  printf("Case #%d: %s\n",tc,valid?"Yes":"No");
 }
 return 0;
}
