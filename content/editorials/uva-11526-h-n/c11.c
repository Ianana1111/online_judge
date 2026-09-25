#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        long long n;
        scanf("%lld", &n);
        if (n <= 0) { puts("0"); continue; }
        long long low = 1, high = 46340;
        while (low < high) {
            long long mid = (low + high + 1) / 2;
            if (mid * mid <= n) low = mid;
            else high = mid - 1;
        }
        long long root = low, sum = 0;
        for (long long i = 1; i <= root; ++i) sum += n / i;
        printf("%lld\n", 2 * sum - root * root);
    }
    return 0;
}
