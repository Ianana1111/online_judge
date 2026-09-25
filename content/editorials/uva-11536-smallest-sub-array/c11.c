#include <stdio.h>
#include <stdlib.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=1;tc<=tests;tc++){
  int n,m,k;scanf("%d %d %d",&n,&m,&k);
  int*values=malloc((size_t)n*sizeof(int));int frequency[101]={0};
  values[0]=1;values[1]=2;values[2]=3;
  for(int i=3;i<n;i++)values[i]=(values[i-1]+values[i-2]+values[i-3])%m+1;
  int left=0,covered=0,best=n+1;
  for(int right=0;right<n;right++){
   int value=values[right];if(value<=k&&++frequency[value]==1)covered++;
   while(covered==k){
    int length=right-left+1;if(length<best)best=length;
    int removed=values[left++];if(removed<=k&&--frequency[removed]==0)covered--;
   }
  }
  printf("Case %d: ",tc);if(best>n)puts("sequence nai");else printf("%d\n",best);
  free(values);
 }
 return 0;
}
