#include <limits.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#define WORDS 79
static uint64_t possible[51][WORDS];
int main(void){
 int n,m;while(scanf("%d %d",&n,&m)==2){
  int k=n<m?n:m,total=0;memset(possible,0,sizeof(possible));possible[0][2500/64]=1ULL<<(2500%64);
  for(int i=0;i<n+m;i++){
   int value;scanf("%d",&value);total+=value;
   for(int count=(i+1<k?i+1:k);count>=1;count--){
    int shift=value<0?-value:value,words=shift/64,bits=shift%64;
    for(int w=0;w<WORDS;w++){
     uint64_t part=0;
     if(value>=0){int src=w-words;
      if(src>=0)part=possible[count-1][src]<<bits;
      if(bits&&src-1>=0)part|=possible[count-1][src-1]>>(64-bits);
     }else{int src=w+words;
      if(src<WORDS)part=possible[count-1][src]>>bits;
      if(bits&&src+1<WORDS)part|=possible[count-1][src+1]<<(64-bits);
     }
     possible[count][w]|=part;
    }
   }
  }
  long long maximum=LLONG_MIN,minimum=LLONG_MAX;
  for(int sum=-2500;sum<=2500;sum++)if(possible[k][(sum+2500)/64]&(1ULL<<((sum+2500)%64))){
   long long product=(long long)sum*(total-sum);
   if(product>maximum)maximum=product;if(product<minimum)minimum=product;
  }
  printf("%lld %lld\n",maximum,minimum);
 }
 return 0;
}
