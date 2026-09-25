#include <stdio.h>
int main(void) {
    long long n;
    while (scanf("%lld", &n) == 1 && n) {
        long long low = 1, high = 44722;
        while (low < high) {
            long long mid = (low + high) / 2;
            if (mid * mid >= n) high = mid;
            else low = mid + 1;
        }
        long long side = low, distance = side * side - n, x, y;
        if (distance < side) { x = side; y = distance + 1; }
        else { x = 2 * side - 1 - distance; y = side; }
        if (side % 2) { long long tmp = x; x = y; y = tmp; }
        printf("%lld %lld\n", x, y);
    }
    return 0;
}
