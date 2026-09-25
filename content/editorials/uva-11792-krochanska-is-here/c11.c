#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int n,s;scanf("%d %d",&n,&s);
  int *head=malloc((size_t)n*sizeof(int)),*lines=calloc((size_t)n,sizeof(int)),*seen=calloc((size_t)n,sizeof(int));
  for(int i=0;i<n;i++)head[i]=-1;
  int capacity=1024,used=0,*to=malloc((size_t)capacity*sizeof(int)),*next=malloc((size_t)capacity*sizeof(int));
  for(int route=1;route<=s;route++){
   int previous=-1,v;
   while(scanf("%d",&v)==1&&v){v--;
    if(seen[v]!=route){seen[v]=route;lines[v]++;}
    if(previous>=0){
     if(used+2>capacity){capacity*=2;to=realloc(to,(size_t)capacity*sizeof(int));next=realloc(next,(size_t)capacity*sizeof(int));}
     to[used]=v;next[used]=head[previous];head[previous]=used++;
     to[used]=previous;next[used]=head[v];head[v]=used++;
    }
    previous=v;
   }
  }
  int *important=malloc((size_t)n*sizeof(int)),count=0;
  for(int i=0;i<n;i++)if(lines[i]>1)important[count++]=i;
  int *distance=malloc((size_t)n*sizeof(int)),*queue=malloc((size_t)n*sizeof(int));
  long long best=LLONG_MAX;int answer=-1;
  for(int i=0;i<count;i++){
   int start=important[i];for(int v=0;v<n;v++)distance[v]=-1;
   int front=0,back=0;queue[back++]=start;distance[start]=0;
   while(front<back){int u=queue[front++];
    for(int e=head[u];e>=0;e=next[e]){int v=to[e];if(distance[v]>=0)continue;distance[v]=distance[u]+1;queue[back++]=v;}
   }
   long long sum=0;for(int j=0;j<count;j++)sum+=distance[important[j]];
   if(sum<best){best=sum;answer=start;}
  }
  printf("Krochanska is in: %d\n",answer+1);
  free(head);free(lines);free(seen);free(to);free(next);free(important);free(distance);free(queue);
 }
 return 0;
}
