#include <stdio.h>
#include <string.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        char digits[17] = "", part[5];
        for (int group = 0; group < 4; ++group) {
            scanf("%4s", part);
            strcat(digits, part);
        }
        int sum = 0;
        for (int i = 0; i < 16; ++i) {
            int value = digits[i] - '0';
            if (i % 2 == 0) {
                value *= 2;
                if (value > 9) value -= 9;
            }
            sum += value;
        }
        puts(sum % 10 == 0 ? "Valid" : "Invalid");
    }
    return 0;
}
