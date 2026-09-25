#include <stdio.h>
static int tree[200001],position[100001];
static void add(int limit,int at,int delta){for(;at<=limit;at+=at&-at)tree[at]+=delta;}
static int prefix(int at){int sum=0;for(;at>0;at-=at&-at)sum+=tree[at];return sum;}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int n,m;scanf("%d %d",&n,&m);int limit=n+m,top=m;
  for(int i=1;i<=limit;i++)tree[i]=0;
  for(int movie=1;movie<=n;movie++){position[movie]=m+movie;add(limit,position[movie],1);}
  for(int request=0;request<m;request++){
   int movie;scanf("%d",&movie);if(request)putchar(' ');
   printf("%d",prefix(position[movie]-1));add(limit,position[movie],-1);
   position[movie]=top--;add(limit,position[movie],1);
  }
  putchar('\n');
 }
 return 0;
}
