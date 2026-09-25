#include <stdio.h>
#define MOD 1000000009LL
long long power(long long base,unsigned long long exponent) {
    long long result=1;
    while(exponent) {
        if(exponent&1) result=result*base%MOD;
        base=base*base%MOD;exponent>>=1;
    }
    return result;
}
int main(void) {
    unsigned long long n;
    while(scanf("%llu",&n)==1) printf("%lld\n",(power(3,n)-2+MOD)%MOD);
    return 0;
}
