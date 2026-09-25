#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        long long keys, doors;
        scanf("%lld %lld", &keys, &doors);
        long long answer = keys * (2 * doors - keys - 1) / 2;
        printf("%lld\n", answer);
    }
    return 0;
}
