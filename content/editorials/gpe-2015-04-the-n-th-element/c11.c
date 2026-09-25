#include <stdio.h>
#include <limits.h>
static long long value(const long long c[3], int i) {
    return c[0] * i * (long long)i + c[1] * i + c[2];
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        long long a[3], b[3]; int n;
        for (int j = 0; j < 3; j++) scanf("%lld", &a[j]);
        for (int j = 0; j < 3; j++) scanf("%lld", &b[j]);
        scanf("%d", &n);
        int low = 0, high = n;
        while (low <= high) {
            int take_a = low + (high - low) / 2, take_b = n - take_a;
            long long al = take_a ? value(a, take_a - 1) : LLONG_MIN;
            long long ar = take_a < n ? value(a, take_a) : LLONG_MAX;
            long long bl = take_b ? value(b, take_b - 1) : LLONG_MIN;
            long long br = take_b < n ? value(b, take_b) : LLONG_MAX;
            if (al > br) high = take_a - 1;
            else if (bl > ar) low = take_a + 1;
            else { printf("%lld\n", al > bl ? al : bl); break; }
        }
    }
    return 0;
}
