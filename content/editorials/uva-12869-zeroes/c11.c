#include <stdio.h>

int main(void) {
    long long low, high;
    while (scanf("%lld %lld", &low, &high) == 2) {
        if (low == 0 && high == 0) break;
        printf("%lld\n", high / 5 - low / 5 + 1);
    }
    return 0;
}
