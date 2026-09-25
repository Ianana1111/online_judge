#include <stdio.h>
#include <string.h>
static int valid(const int *original,int n,int level){
 int runs[100],quotes=0;memcpy(runs,original,(size_t)n*sizeof(int));
 for(int i=0;i<n;i++)quotes+=runs[i];
 if(quotes%2)return 0;if(level==1)return quotes==2;
 int left=0,right=n-1;
 for(int layer=level;layer>=2;layer--){
  while(left<=right&&runs[left]==0)left++;
  while(left<=right&&runs[right]==0)right--;
  if(left>right||runs[left]<layer||runs[right]<layer)return 0;
  if(left==right&&runs[left]<2*layer)return 0;
  runs[left]-=layer;runs[right]-=layer;quotes-=2*layer;
 }
 return quotes>=2;
}
int main(void){
 int n;while(scanf("%d",&n)==1){int runs[100],total=0;
  for(int i=0;i<n;i++){scanf("%d",&runs[i]);total+=runs[i];}
  int limit=runs[0]<runs[n-1]?runs[0]:runs[n-1],answer=0;
  for(int k=limit;k>=1;k--)if(k*(k+1)<=total&&valid(runs,n,k)){answer=k;break;}
  if(answer)printf("%d\n",answer);else puts("no quotation");
 }
 return 0;
}
