#include <stdio.h>
#include <stdlib.h>
static int minimum(int a,int b,int c){int x=a<b?a:b;return x<c?x:c;}
int main(void){
 int m,n;
 while(scanf("%d",&m)==1){
  char*x=malloc((size_t)m+1);if(m)scanf("%s",x);else x[0]=0;
  scanf("%d",&n);char*y=malloc((size_t)n+1);if(n)scanf("%s",y);else y[0]=0;
  int*previous=malloc(((size_t)n+1)*sizeof(int));
  int*current=malloc(((size_t)n+1)*sizeof(int));
  for(int j=0;j<=n;j++)previous[j]=j;
  for(int i=1;i<=m;i++){
   current[0]=i;
   for(int j=1;j<=n;j++)current[j]=minimum(previous[j]+1,current[j-1]+1,previous[j-1]+(x[i-1]!=y[j-1]));
   int*tmp=previous;previous=current;current=tmp;
  }
  printf("%d\n",previous[n]);free(x);free(y);free(previous);free(current);
 }
 return 0;
}
