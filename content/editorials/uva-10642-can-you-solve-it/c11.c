#include <stdio.h>

long long position(long long x, long long y) {
    long long diagonal = x + y;
    return diagonal * (diagonal + 1) / 2 + x;
}

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        long long x, y, a, b;
        scanf("%lld %lld %lld %lld", &x, &y, &a, &b);
        printf("Case %d: %lld\n", case_number, position(a, b) - position(x, y));
    }
    return 0;
}
