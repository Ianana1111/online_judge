#include <stdio.h>
static long long length[48];
static char digit(int level,long long position){
 while(level>=2){long long split=length[level-2];if(position<split)level-=2;else{position-=split;level--;}}
 return (char)('0'+level);
}
int main(void){
 length[0]=length[1]=1;for(int i=2;i<=47;i++)length[i]=length[i-2]+length[i-1];
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){long long n,left,right;scanf("%lld %lld %lld",&n,&left,&right);
  if(n>47)n=46+(n-46)%2;
  for(long long p=left;p<=right;p++)putchar(digit((int)n,p));putchar('\n');
 }
 return 0;
}
