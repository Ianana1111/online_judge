#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int n, count[10] = {0};
        scanf("%d", &n);
        for (int value = 1; value <= n; ++value) {
            for (int x = value; x > 0; x /= 10) ++count[x % 10];
        }
        for (int digit = 0; digit < 10; ++digit) {
            printf("%s%d", digit ? " " : "", count[digit]);
        }
        putchar('\n');
    }
    return 0;
}
