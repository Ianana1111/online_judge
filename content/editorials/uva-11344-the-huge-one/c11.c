#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        char number[1002];
        int count, divisors[12];
        scanf("%1001s %d", number, &count);
        for (int i = 0; i < count; ++i) scanf("%d", &divisors[i]);
        int wonderful = 1;
        for (int i = 0; i < count; ++i) {
            int remainder = 0;
            for (int j = 0; number[j] != '\0'; ++j)
                remainder = (remainder * 10 + number[j] - '0') % divisors[i];
            if (remainder != 0) wonderful = 0;
        }
        printf("%s - %s\n", number, wonderful ? "Wonderful." : "Simple.");
    }
    return 0;
}
