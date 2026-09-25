#include <stdio.h>
#include <string.h>
static int possible(const char *y,const char *x,int bound){
 int m=(int)strlen(y),previous[51],current[51],finished=0;
 for(int j=0;j<=m;j++)previous[j]=j;
 for(const char *at=x;*at;at++){
  current[0]=previous[0]+1;
  for(int j=1;j<=m;j++){
   int a=previous[j]+1,b=current[j-1]+1,c=previous[j-1]+(*at!=y[j-1]);
   int small=a<b?a:b;current[j]=small<c?small:c;
  }
  finished=current[m]<=bound;
  if(finished)for(int j=0;j<=m;j++)if(j<current[j])current[j]=j;
  for(int j=0;j<=m;j++)previous[j]=current[j];
 }
 return finished;
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){char y[51],x[5001];scanf("%50s %5000s",y,x);
  int low=0,high=(int)strlen(y);
  while(low<high){int mid=(low+high)/2;if(possible(y,x,mid))high=mid;else low=mid+1;}
  printf("%d\n",low);
 }
 return 0;
}
