#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        char plate[16];
        scanf("%15s", plate);
        int letters = 0, digits = 0;
        for (int i = 0; i < 3; ++i) letters = letters * 26 + plate[i] - 'A';
        for (int i = 4; i < 8; ++i) digits = digits * 10 + plate[i] - '0';
        puts(abs(letters - digits) <= 100 ? "nice" : "not nice");
    }
    return 0;
}
