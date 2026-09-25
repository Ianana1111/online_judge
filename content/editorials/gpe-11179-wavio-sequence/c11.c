#include <stdio.h>
static long long values[10000],tails[10000];
static int left[10000],right[10000];
static int insert(long long value,int size){
 int low=0,high=size;
 while(low<high){int mid=(low+high)/2;if(tails[mid]<value)low=mid+1;else high=mid;}
 tails[low]=value;return low;
}
int main(void){
 int n;
 while(scanf("%d",&n)==1){
  for(int i=0;i<n;i++)scanf("%lld",&values[i]);
  int size=0;
  for(int i=0;i<n;i++){int at=insert(values[i],size);if(at==size)size++;left[i]=at+1;}
  size=0;
  for(int i=n-1;i>=0;i--){int at=insert(values[i],size);if(at==size)size++;right[i]=at+1;}
  int answer=1;
  for(int i=0;i<n;i++){int arm=left[i]<right[i]?left[i]:right[i];
   if(2*arm-1>answer)answer=2*arm-1;}
  printf("%d\n",answer);
 }
 return 0;
}
