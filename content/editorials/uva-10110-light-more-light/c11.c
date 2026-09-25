#include <stdio.h>

int main(void) {
    unsigned long long n;
    while (scanf("%llu", &n) == 1 && n != 0) {
        unsigned long long low = 1, high = 65535;
        int square = 0;
        while (low <= high) {
            unsigned long long mid = low + (high - low) / 2;
            unsigned long long value = mid * mid;
            if (value == n) { square = 1; break; }
            if (value < n) low = mid + 1;
            else high = mid - 1;
        }
        puts(square ? "yes" : "no");
    }
    return 0;
}
