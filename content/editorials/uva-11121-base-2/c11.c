#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        long long n;
        scanf("%lld", &n);
        char digits[100];
        int length = 0;
        do {
            int bit = (int)((n % 2 + 2) % 2);
            digits[length++] = (char)('0' + bit);
            n = (n - bit) / -2;
        } while (n != 0);
        printf("Case #%d: ", case_number);
        while (length > 0) putchar(digits[--length]);
        putchar('\n');
    }
    return 0;
}
