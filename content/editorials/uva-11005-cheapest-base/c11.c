#include <stdio.h>
#include <limits.h>
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 1; tc <= tests; tc++) {
        int cost[36]; for (int i = 0; i < 36; i++) scanf("%d", &cost[i]);
        int queries; scanf("%d", &queries);
        if (tc > 1) putchar('\n');
        printf("Case %d:\n", tc);
        while (queries--) {
            long long number; scanf("%lld", &number);
            int best = INT_MAX, bases[35], count = 0;
            for (int base = 2; base <= 36; base++) {
                long long x = number; int total = 0;
                do { total += cost[x % base]; x /= base; } while (x > 0);
                if (total < best) { best = total; count = 0; }
                if (total == best) bases[count++] = base;
            }
            printf("Cheapest base(s) for number %lld:", number);
            for (int i = 0; i < count; i++) printf(" %d", bases[i]);
            putchar('\n');
        }
    }
    return 0;
}
