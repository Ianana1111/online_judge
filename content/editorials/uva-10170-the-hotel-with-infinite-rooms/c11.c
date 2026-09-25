#include <stdio.h>

int main(void) {
    long long start, day;
    while (scanf("%lld %lld", &start, &day) == 2) {
        long long low = start, high = 100000000;
        while (low < high) {
            long long mid = low + (high - low) / 2;
            long long through = (mid - start + 1) * (start + mid) / 2;
            if (through >= day) high = mid;
            else low = mid + 1;
        }
        printf("%lld\n", low);
    }
    return 0;
}
