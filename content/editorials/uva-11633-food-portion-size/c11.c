#include <limits.h>
#include <stdio.h>
static long long gcd(long long a,long long b){while(b){long long r=a%b;a=b;b=r;}return a<0?-a:a;}
int main(void){
 int n;
 while(scanf("%d",&n)==1&&n){
  long long a,b,total=0;scanf("%lld %lld",&a,&b);
  int frequency[101]={0},prefix[101]={0},largest=0;
  for(int i=0;i<n;i++){int y;scanf("%d",&y);frequency[y]++;total+=y;if(y>largest)largest=y;}
  for(int y=1;y<=100;y++)prefix[y]=prefix[y-1]+frequency[y];
  long long best_num=LLONG_MAX,best_den=1;
  for(int p=1;p<=100;p++)if(frequency[p])for(int q=1;q<=3;q++){
   if(3*p<largest*q)continue;
   int one=p/q,two=2*p/q;if(two>100)two=100;
   long long visits=3LL*n-prefix[one]-prefix[two];
   long long num=(a*p+b*q)*visits-a*total*q;
   if(best_num==LLONG_MAX||num*best_den<best_num*q){best_num=num;best_den=q;}
  }
  long long divisor=gcd(best_num,best_den);best_num/=divisor;best_den/=divisor;
  printf("%lld",best_num);if(best_den!=1)printf(" / %lld",best_den);putchar('\n');
 }
 return 0;
}
