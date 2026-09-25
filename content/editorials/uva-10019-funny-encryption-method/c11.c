#include <stdio.h>

int count_bits(int value) {
    int count = 0;
    while (value > 0) {
        count += value % 2;
        value /= 2;
    }
    return count;
}

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        char digits[8];
        scanf("%7s", digits);
        int decimal = 0, hexadecimal = 0;
        for (int i = 0; digits[i] != '\0'; ++i) {
            int digit = digits[i] - '0';
            decimal = decimal * 10 + digit;
            hexadecimal = hexadecimal * 16 + digit;
        }
        printf("%d %d\n", count_bits(decimal), count_bits(hexadecimal));
    }
    return 0;
}
