#include <stdio.h>
#include <stdlib.h>
static int next_int(void){int c;do{c=getchar();}while(c!=EOF&&(c<'0'||c>'9'));if(c==EOF)return -1;
 int value=0;while(c>='0'&&c<='9'){value=value*10+c-'0';c=getchar();}return value;
}
int main(void){
 int n;while((n=next_int())>=0){
  int *head=malloc((size_t)n*sizeof(int)),*to=malloc((size_t)(2*n)*sizeof(int)),*next=malloc((size_t)(2*n)*sizeof(int));
  int *parent=malloc((size_t)n*sizeof(int)),*order=malloc((size_t)n*sizeof(int));
  int *off=calloc((size_t)n,sizeof(int)),*on=malloc((size_t)n*sizeof(int)),used=0;
  for(int i=0;i<n;i++){head[i]=-1;parent[i]=-1;on[i]=1;}
  for(int i=0;i<n;i++){
   int u=next_int(),k=next_int();
   while(k--){int v=next_int();to[used]=v;next[used]=head[u];head[u]=used++;
    to[used]=u;next[used]=head[v];head[v]=used++;
   }
  }
  int count=1;order[0]=0;parent[0]=0;
  for(int i=0;i<count;i++){int u=order[i];
   for(int e=head[u];e>=0;e=next[e]){int v=to[e];if(v==parent[u])continue;parent[v]=u;order[count++]=v;}
  }
  for(int i=count-1;i>=0;i--){int u=order[i];
   for(int e=head[u];e>=0;e=next[e]){int v=to[e];if(parent[v]!=u)continue;
    off[u]+=on[v];on[u]+=off[v]<on[v]?off[v]:on[v];
   }
  }
  printf("%d\n",off[0]<on[0]?off[0]:on[0]);
  free(head);free(to);free(next);free(parent);free(order);free(off);free(on);
 }
 return 0;
}
