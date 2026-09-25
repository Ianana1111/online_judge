#include <math.h>
#include <stdio.h>
int main(void){
 char city[16];while(scanf("%15s",city)==1){
  long long start[3],finish[3],direction[3],a=0;
  for(int i=0;i<3;i++)scanf("%lld",&start[i]);
  for(int i=0;i<3;i++)scanf("%lld",&finish[i]);
  for(int i=0;i<3;i++){direction[i]=finish[i]-start[i];a+=direction[i]*direction[i];}
  int n;scanf("%d",&n);long double fraction=0;
  for(int j=0;j<n;j++){
   long long center[3],radius,b=0,c=0;
   for(int i=0;i<3;i++)scanf("%lld",&center[i]);scanf("%lld",&radius);c=-radius*radius;
   for(int i=0;i<3;i++){long long offset=start[i]-center[i];b+=offset*direction[i];c+=offset*offset;}
   long long discriminant=b*b-a*c;if(discriminant<=0)continue;
   long double root=sqrtl((long double)discriminant),enter=(-b-root)/a,leave=(-b+root)/a;
   long double inside=fminl(1.0L,leave)-fmaxl(0.0L,enter);
   if(inside>0)fraction+=inside;
  }
  printf("%s\n%.2Lf\n",city,100*fraction);
 }
 return 0;
}
