#include <stdio.h>
#include <stdlib.h>
typedef struct{int u,v,cost;}Edge;
static int parent[10001],size[10001];
static int find(int x){while(parent[x]!=x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
static int descending(const void *left,const void *right){
 const Edge *a=left,*b=right;return (b->cost>a->cost)-(b->cost<a->cost);
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int n,m;scanf("%d %d",&n,&m);Edge *edges=malloc((size_t)m*sizeof(Edge));
  for(int i=0;i<m;i++)scanf("%d %d %d",&edges[i].u,&edges[i].v,&edges[i].cost);
  qsort(edges,m,sizeof(Edge),descending);
  for(int i=1;i<=n;i++){parent[i]=i;size[i]=1;}
  long long answer=0;
  for(int i=0;i<m;i++){
   int u=find(edges[i].u),v=find(edges[i].v);
   if(u==v){answer+=edges[i].cost;continue;}
   if(size[u]<size[v]){int temp=u;u=v;v=temp;}
   parent[v]=u;size[u]+=size[v];
  }
  printf("%lld\n",answer);free(edges);
 }
 return 0;
}
