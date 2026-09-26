#include <stdio.h>
#include <stdlib.h>
typedef __int128 Integer;
typedef struct {Integer a,b,c;} Line;
Integer magnitude(Integer x){return x<0?-x:x;}
Integer gcd(Integer a,Integer b){a=magnitude(a);b=magnitude(b);while(b){Integer t=a%b;a=b;b=t;}return a;}
int compare(const void *a,const void *b){const Line *p=(const Line*)a,*q=(const Line*)b;if(p->a!=q->a)return(p->a>q->a)-(p->a<q->a);if(p->b!=q->b)return(p->b>q->b)-(p->b<q->b);return(p->c>q->c)-(p->c<q->c);}
int main(void){int cases;scanf("%d",&cases);while(cases--){int n,count=0;long long x[100],y[100];Line lines[4950];scanf("%d",&n);for(int i=0;i<n;i++)scanf("%lld%lld",&x[i],&y[i]);for(int i=0;i<n;i++)for(int j=0;j<i;j++){Integer a=(Integer)y[j]-y[i],b=(Integer)x[i]-x[j],c=-(a*x[i]+b*y[i]),d=gcd(gcd(a,b),c);a/=d;b/=d;c/=d;if(a<0||(a==0&&b<0)){a=-a;b=-b;c=-c;}lines[count++]=(Line){a,b,c};}qsort(lines,count,sizeof(Line),compare);int answer=0;for(int i=0;i<count;i++)if(i==0||compare(&lines[i],&lines[i-1]))answer++;printf("%d\n",answer);}return 0;}
