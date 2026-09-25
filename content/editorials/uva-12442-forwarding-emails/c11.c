#include <stdio.h>
#include <stdlib.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n;scanf("%d",&n);int *next=malloc((size_t)n*sizeof(int)),*indegree=calloc((size_t)n,sizeof(int));
  int *reach=calloc((size_t)n,sizeof(int)),*queue=malloc((size_t)n*sizeof(int)),*removed=malloc((size_t)n*sizeof(int));
  for(int i=0;i<n;i++){int u,v;scanf("%d %d",&u,&v);next[u-1]=v-1;indegree[v-1]++;}
  int head=0,tail=0,count=0;for(int i=0;i<n;i++)if(indegree[i]==0)queue[tail++]=i;
  while(head<tail){int u=queue[head++];removed[count++]=u;int v=next[u];if(--indegree[v]==0)queue[tail++]=v;}
  for(int start=0;start<n;start++)if(indegree[start]>0&&reach[start]==0){
   int size=0,at=start;do{size++;at=next[at];}while(at!=start);
   at=start;do{reach[at]=size;at=next[at];}while(at!=start);
  }
  for(int i=count-1;i>=0;i--){int u=removed[i];reach[u]=reach[next[u]]+1;}
  int best=0;for(int i=1;i<n;i++)if(reach[i]>reach[best])best=i;
  printf("Case %d: %d\n",tc,best+1);
  free(next);free(indegree);free(reach);free(queue);free(removed);
 }
 return 0;
}
