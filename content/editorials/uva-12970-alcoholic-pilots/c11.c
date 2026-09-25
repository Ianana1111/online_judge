#include <stdio.h>

static long long gcd(long long a, long long b) {
    while (b != 0) { long long remainder = a % b; a = b; b = remainder; }
    return a;
}
int main(void) {
    long long v1,d1,v2,d2;
    int case_number = 0;
    while (scanf("%lld %lld %lld %lld", &v1,&d1,&v2,&d2) == 4
           && (v1 != 0 || d1 != 0 || v2 != 0 || d2 != 0)) {
        int captain = d1*v2 < d2*v1;
        long long numerator = d1*v2 + d2*v1;
        long long denominator = 2*v1*v2;
        long long divisor = gcd(numerator, denominator);
        numerator /= divisor;
        denominator /= divisor;
        printf("Case #%d: %s\n", ++case_number,
               captain ? "You owe me a beer!" : "No beer for the captain.");
        printf("Avg. arrival time: %lld", numerator);
        if (denominator != 1) printf("/%lld", denominator);
        putchar('\n');
    }
    return 0;
}
