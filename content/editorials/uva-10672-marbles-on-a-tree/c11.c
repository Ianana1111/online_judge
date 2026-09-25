#include <stdio.h>
#include <stdlib.h>
static int parent[10000],balance[10000],head[10000],next[10000],order[10000];
int main(void){
 int n;
 while(scanf("%d",&n)==1&&n){
  for(int i=0;i<n;i++){parent[i]=-1;head[i]=-1;}
  for(int i=0;i<n;i++){
   int node,marbles,count;scanf("%d %d %d",&node,&marbles,&count);node--;
   balance[node]=marbles-1;
   while(count--){int child;scanf("%d",&child);child--;
    parent[child]=node;next[child]=head[node];head[node]=child;}
  }
  int root=0;while(parent[root]!=-1)root++;
  int size=1;order[0]=root;
  for(int i=0;i<size;i++)for(int child=head[order[i]];child!=-1;child=next[child])order[size++]=child;
  long long moves=0;
  for(int i=n-1;i>0;i--){int node=order[i];moves+=llabs((long long)balance[node]);balance[parent[node]]+=balance[node];}
  printf("%lld\n",moves);
 }
 return 0;
}
