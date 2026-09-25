#include <stdio.h>
int main(void) {
    long long n;
    while(scanf("%lld",&n)==1) {
        long long low=1,high=10000;
        while(low<high) {
            long long mid=(low+high)/2;
            if(mid*(mid+1)/2>=n) high=mid;
            else low=mid+1;
        }
        long long diagonal=low,offset=n-diagonal*(diagonal-1)/2;
        long long numerator=diagonal%2?diagonal+1-offset:offset;
        printf("TERM %lld IS %lld/%lld\n",n,numerator,diagonal+1-numerator);
    }
    return 0;
}
