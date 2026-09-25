#include <stdio.h>
#include <stdlib.h>
typedef struct{int deadline,profit;} Product;
static Product products[10000];static int heap[10001],size;
static int compare(const void*a,const void*b){
 int x=((const Product*)a)->deadline,y=((const Product*)b)->deadline;return x<y?-1:x>y?1:0;
}
static void push(int value){int at=++size;
 while(at>1&&heap[at/2]>value){heap[at]=heap[at/2];at/=2;}heap[at]=value;}
static int pop(void){int result=heap[1],value=heap[size--],at=1;
 while(at*2<=size){int child=at*2;if(child<size&&heap[child+1]<heap[child])child++;
  if(heap[child]>=value)break;heap[at]=heap[child];at=child;}
 if(size)heap[at]=value;return result;}
int main(void){
 int n;
 while(scanf("%d",&n)==1){
  for(int i=0;i<n;i++)scanf("%d %d",&products[i].profit,&products[i].deadline);
  qsort(products,n,sizeof(Product),compare);size=0;long long total=0;
  for(int i=0;i<n;i++){
   push(products[i].profit);total+=products[i].profit;
   if(size>products[i].deadline)total-=pop();
  }
  printf("%lld\n",total);
 }
 return 0;
}
