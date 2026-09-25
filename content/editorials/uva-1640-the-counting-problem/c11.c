#include <stdio.h>
static void prefix(long long n,long long answer[10]){
 for(int d=0;d<10;d++)answer[d]=0;
 for(long long factor=1;factor<=n;factor*=10){
  long long higher=n/(factor*10),digit=n/factor%10,lower=n%factor;
  for(int d=1;d<=9;d++){
   answer[d]+=higher*factor;
   if(digit>d)answer[d]+=factor;
   else if(digit==d)answer[d]+=lower+1;
  }
  if(higher>0)answer[0]+=(higher-1)*factor+(digit==0?lower+1:factor);
 }
}
int main(void){
 long long a,b,before[10],after[10];
 while(scanf("%lld %lld",&a,&b)==2&&(a||b)){
  if(a>b){long long temp=a;a=b;b=temp;}
  prefix(a-1,before);prefix(b,after);
  for(int d=0;d<10;d++){if(d)putchar(' ');printf("%lld",after[d]-before[d]);}
  putchar('\n');
 }
 return 0;
}
