#include <stdio.h>

int main(void) {
    long long count;
    while (scanf("%lld", &count) == 1) {
        long long row = (count + 1) / 2;
        long long last = 2 * row * row - 1;
        printf("%lld\n", 3 * last - 6);
    }
    return 0;
}
