#include <stdio.h>
static int digit_sum(long long value) {
    int sum = 0;
    while (value) { sum += value % 10; value /= 10; }
    return sum;
}
static int smith(long long value) {
    long long remaining = value;
    int sum = 0, factors = 0;
    for (long long divisor = 2; divisor * divisor <= remaining; divisor++) {
        while (remaining % divisor == 0) {
            remaining /= divisor; sum += digit_sum(divisor); factors++;
        }
    }
    if (remaining > 1) { sum += digit_sum(remaining); factors++; }
    return factors > 1 && sum == digit_sum(value);
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        long long value; scanf("%lld", &value); value++;
        while (!smith(value)) value++;
        printf("%lld\n", value);
    }
    return 0;
}
