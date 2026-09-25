#include <stdio.h>

int main(void) {
    long long difference;
    while (scanf("%lld", &difference) == 1 && difference != 0) {
        long long quotient = difference / 9;
        long long remainder = difference % 9;
        if (remainder == 0) printf("%lld %lld\n", 10 * quotient - 1, 10 * quotient);
        else printf("%lld\n", 10 * quotient + remainder);
    }
    return 0;
}
