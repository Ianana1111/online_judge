#include <stdio.h>
#include <stdlib.h>
typedef struct{long long distance;int u;}State;
static State *heap;static int count,capacity;
static void push(State value){
 if(count+1>=capacity){capacity=capacity?capacity*2:128;heap=realloc(heap,(size_t)capacity*sizeof(State));}
 int i=++count;while(i>1&&heap[i/2].distance>value.distance){heap[i]=heap[i/2];i/=2;}heap[i]=value;
}
static State pop(void){
 State answer=heap[1],last=heap[count--];int i=1;
 while(2*i<=count){int child=2*i;if(child<count&&heap[child+1].distance<heap[child].distance)child++;
  if(heap[child].distance>=last.distance)break;heap[i]=heap[child];i=child;
 }
 if(count)heap[i]=last;return answer;
}
int main(void){
 int n,m;while(scanf("%d %d",&n,&m)==2&&(n||m)){
  int source,target,k;scanf("%d %d %d",&source,&target,&k);source--;target--;
  int *head=malloc((size_t)n*sizeof(int)),*to=malloc((size_t)m*sizeof(int));
  int *weight=malloc((size_t)m*sizeof(int)),*next=malloc((size_t)m*sizeof(int)),*popped=calloc((size_t)n,sizeof(int));
  for(int i=0;i<n;i++)head[i]=-1;
  for(int i=0;i<m;i++){int u,v,w;scanf("%d %d %d",&u,&v,&w);u--;v--;
   to[i]=v;weight[i]=w;next[i]=head[u];head[u]=i;
  }
  heap=NULL;count=capacity=0;push((State){0,source});long long answer=-1;
  while(count){State state=pop();int u=state.u;
   if(popped[u]>=k)continue;popped[u]++;
   if(u==target&&popped[u]==k){answer=state.distance;break;}
   for(int e=head[u];e>=0;e=next[e])push((State){state.distance+weight[e],to[e]});
  }
  printf("%lld\n",answer);
  free(head);free(to);free(weight);free(next);free(popped);free(heap);
 }
 return 0;
}
