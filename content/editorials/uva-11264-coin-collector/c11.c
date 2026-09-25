#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int n;
        long long coins[1000];
        scanf("%d", &n);
        for (int i = 0; i < n; ++i) scanf("%lld", &coins[i]);
        long long sum = 0;
        int types = 0;
        for (int i = 0; i + 1 < n; ++i) {
            if (sum + coins[i] < coins[i + 1]) {
                sum += coins[i];
                ++types;
            }
        }
        printf("%d\n", types + 1);
    }
    return 0;
}
