#include <stdio.h>
int main(void) {
    unsigned long long n, lower, upper;
    while (scanf("%llu %llu %llu", &n, &lower, &upper) == 3) {
        unsigned long long mask = 0;
        for (int i = 31; i >= 0; i--) {
            unsigned long long bit = 1ULL << i;
            if ((n & bit) == 0) {
                if ((mask | bit) <= upper) mask |= bit;
            } else if ((mask | (bit - 1)) < lower) mask |= bit;
        }
        printf("%llu\n", mask);
    }
    return 0;
}
