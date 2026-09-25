#include <stdio.h>
#include <stdlib.h>
typedef struct{int u,v,w;} Edge;
static Edge edges[25000];
static int parent[1000],size[1000];
static int compare(const void*a,const void*b){
 int x=((const Edge*)a)->w,y=((const Edge*)b)->w;return x<y?-1:x>y?1:0;
}
static int find(int x){while(parent[x]!=x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
int main(void){
 int n,m;
 while(scanf("%d %d",&n,&m)==2&&(n||m)){
  for(int i=0;i<m;i++)scanf("%d %d %d",&edges[i].u,&edges[i].v,&edges[i].w);
  qsort(edges,m,sizeof(Edge),compare);
  for(int i=0;i<n;i++){parent[i]=i;size[i]=1;}
  int count=0;
  for(int i=0;i<m;i++){
   int u=find(edges[i].u),v=find(edges[i].v);
   if(u==v){if(count++)putchar(' ');printf("%d",edges[i].w);}
   else{if(size[u]<size[v]){int t=u;u=v;v=t;}parent[v]=u;size[u]+=size[v];}
  }
  if(!count)printf("forest");putchar('\n');
 }
 return 0;
}
