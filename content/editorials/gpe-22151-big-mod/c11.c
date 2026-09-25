#include <stdio.h>

int main(void) {
    long long base, exponent, modulus;
    while (scanf("%lld %lld %lld", &base, &exponent, &modulus) == 3) {
        base %= modulus;
        long long result = 1 % modulus;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % modulus;
            base = base * base % modulus;
            exponent >>= 1;
        }
        printf("%lld\n", result);
    }
    return 0;
}
