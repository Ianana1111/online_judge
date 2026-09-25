#include <stdio.h>
#include <stdlib.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int n,sticks[20],total=0,largest=0;scanf("%d",&n);
  for(int i=0;i<n;i++){scanf("%d",&sticks[i]);total+=sticks[i];if(sticks[i]>largest)largest=sticks[i];}
  if(total%4||largest>total/4){puts("no");continue;}
  int side=total/4,states=1<<n;int *remainder=malloc((size_t)states*sizeof(int));
  for(int mask=0;mask<states;mask++)remainder[mask]=-1;remainder[0]=0;
  for(int mask=0;mask<states;mask++)if(remainder[mask]>=0){
   for(int i=0;i<n;i++)if(!(mask&(1<<i))&&remainder[mask]+sticks[i]<=side){
    remainder[mask|(1<<i)]=(remainder[mask]+sticks[i])%side;
   }
  }
  puts(remainder[states-1]==0?"yes":"no");free(remainder);
 }
 return 0;
}
