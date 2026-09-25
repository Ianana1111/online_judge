#include <stdio.h>
#include <stdlib.h>
static int next_int(void){int c;do{c=getchar();}while(c<=32&&c!=EOF);if(c==EOF)return -1;int value=0;while(c>32){value=value*10+c-'0';c=getchar();}return value;}
int main(void){
 int tests=next_int();if(tests<0)return 0;
 while(tests--){
  int n=next_int(),edge_count=2*(n-1),used=0;
  int *head=malloc((size_t)n*sizeof(int)),*to=malloc((size_t)(edge_count?edge_count:1)*sizeof(int));
  int *next=malloc((size_t)(edge_count?edge_count:1)*sizeof(int)),*weight=malloc((size_t)(edge_count?edge_count:1)*sizeof(int));
  for(int i=0;i<n;i++)head[i]=-1;
  for(int i=1;i<n;i++){
   int u=next_int()-1,v=next_int()-1,w=next_int();
   to[used]=v;weight[used]=w;next[used]=head[u];head[u]=used++;
   to[used]=u;weight[used]=w;next[used]=head[v];head[v]=used++;
  }
  long long *frequency=calloc((size_t)n,sizeof(long long)),*subtree=calloc((size_t)n,sizeof(long long));
  long long *cost=calloc((size_t)n,sizeof(long long)),*distance=calloc((size_t)n,sizeof(long long));
  int m=next_int();while(m--){int u=next_int()-1,f=next_int();frequency[u]=f;}
  int *parent=malloc((size_t)n*sizeof(int)),*edge=malloc((size_t)n*sizeof(int)),*order=malloc((size_t)n*sizeof(int));
  parent[0]=0;order[0]=0;int count=1;
  for(int index=0;index<count;index++){int u=order[index];
   for(int e=head[u];e>=0;e=next[e]){int v=to[e];if(v==parent[u])continue;
    parent[v]=u;edge[v]=weight[e];distance[v]=distance[u]+weight[e];order[count++]=v;
   }
  }
  long long total=0;
  for(int u=0;u<n;u++){total+=frequency[u];cost[0]+=frequency[u]*distance[u];subtree[u]=frequency[u];}
  for(int i=n-1;i>0;i--){int u=order[i];subtree[parent[u]]+=subtree[u];}
  for(int i=1;i<n;i++){int v=order[i],u=parent[v];cost[v]=cost[u]+(long long)edge[v]*(total-2*subtree[v]);}
  long long best=cost[0];for(int u=1;u<n;u++)if(cost[u]<best)best=cost[u];
  printf("%lld\n",2*best);int first=1;
  for(int u=0;u<n;u++)if(cost[u]==best){if(!first)putchar(' ');printf("%d",u+1);first=0;}
  putchar('\n');
  free(head);free(to);free(next);free(weight);free(frequency);free(subtree);free(cost);free(distance);free(parent);free(edge);free(order);
 }
 return 0;
}
