#include <stdio.h>

int main(void) {
    int digits;
    while (scanf("%d", &digits) == 1) {
        long long base = 1;
        for (int i = 0; i < digits / 2; ++i) base *= 10;
        for (long long root = 0; root < base; ++root) {
            long long value = root * root;
            if (value / base + value % base == root)
                printf("%0*lld\n", digits, value);
        }
    }
    return 0;
}
