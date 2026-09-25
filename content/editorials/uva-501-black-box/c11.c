#include <stdio.h>
typedef struct{long long values[30001];int size,sign;}Heap;
static Heap lower,upper;
static void push(Heap *heap,long long value){
 long long key=value*heap->sign;int i=++heap->size;
 while(i>1&&heap->values[i/2]>key){heap->values[i]=heap->values[i/2];i/=2;}
 heap->values[i]=key;
}
static long long top(Heap *heap){return heap->values[1]*heap->sign;}
static long long pop(Heap *heap){
 long long answer=heap->values[1]*heap->sign,last=heap->values[heap->size--];int i=1;
 while(2*i<=heap->size){int child=2*i;if(child<heap->size&&heap->values[child+1]<heap->values[child])child++;
  if(heap->values[child]>=last)break;heap->values[i]=heap->values[child];i=child;
 }
 if(heap->size)heap->values[i]=last;return answer;
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int t=0;t<tests;t++){
  int m,n;scanf("%d %d",&m,&n);long long values[30000];int queries[30000];
  for(int i=0;i<m;i++)scanf("%lld",&values[i]);for(int i=0;i<n;i++)scanf("%d",&queries[i]);
  lower.size=upper.size=0;lower.sign=-1;upper.sign=1;int inserted=0;
  if(t)putchar('\n');
  for(int rank=0;rank<n;rank++){
   while(inserted<queries[rank]){
    long long value=values[inserted++];
    if(lower.size&&value<top(&lower)){push(&lower,value);push(&upper,pop(&lower));}
    else push(&upper,value);
   }
   push(&lower,pop(&upper));printf("%lld\n",top(&lower));
  }
 }
 return 0;
}
