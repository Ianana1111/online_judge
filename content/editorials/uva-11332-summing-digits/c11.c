#include <stdio.h>

int main(void) {
    long long value;
    while (scanf("%lld", &value) == 1 && value != 0) {
        while (value >= 10) {
            long long sum = 0;
            while (value > 0) {
                sum += value % 10;
                value /= 10;
            }
            value = sum;
        }
        printf("%lld\n", value);
    }
    return 0;
}
