#include <stdio.h>

int main(void) {
    long long sum;
    while (scanf("%lld", &sum) == 1 && sum != 0) {
        long long low = 1, high = 20000;
        while (low < high) {
            long long mid = (low + high) / 2;
            if (mid * (mid + 1) / 2 > sum) high = mid;
            else low = mid + 1;
        }
        long long pages = low;
        long long missing = pages * (pages + 1) / 2 - sum;
        printf("%lld %lld\n", missing, pages);
    }
    return 0;
}
