#include <math.h>
#include <stdio.h>
#include <stdlib.h>
typedef struct{long long square;int a,b;} Edge;
static Edge edges[125000];static int x[500],y[500],parent[500],size[500];
static int compare(const void*a,const void*b){
 long long x=((const Edge*)a)->square,z=((const Edge*)b)->square;return x<z?-1:x>z?1:0;}
static int find(int a){return parent[a]==a?a:(parent[a]=find(parent[a]));}
static int join(int a,int b){a=find(a);b=find(b);if(a==b)return 0;
 if(size[a]<size[b]){int t=a;a=b;b=t;}parent[b]=a;size[a]+=size[b];return 1;}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int satellites,n;scanf("%d %d",&satellites,&n);
  for(int i=0;i<n;i++){scanf("%d %d",&x[i],&y[i]);parent[i]=i;size[i]=1;}
  int count=0;
  for(int i=0;i<n;i++)for(int j=i+1;j<n;j++){
   long long dx=x[i]-x[j],dy=y[i]-y[j];edges[count++]=(Edge){dx*dx+dy*dy,i,j};
  }
  qsort(edges,count,sizeof(Edge),compare);
  int chosen=0;long long answer=0;
  for(int i=0;i<count;i++)if(join(edges[i].a,edges[i].b)){
   answer=edges[i].square;if(++chosen==n-satellites)break;
  }
  printf("%.2f\n",sqrt((double)answer));
 }
 return 0;
}
