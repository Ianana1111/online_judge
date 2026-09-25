#include <stdio.h>
#include <string.h>
int main(void) {
    int prefix[100] = {0};
    for (int i = 1; i < 100; i++) {
        int term = 1;
        for (int e = 0; e < i; e++) term = term * (i % 10) % 10;
        prefix[i] = (prefix[i - 1] + term) % 10;
    }
    char number[1005];
    while (scanf("%1004s", number) == 1) {
        int remainder = 0, nonzero = 0;
        for (int i = 0; number[i]; i++) {
            if (number[i] != '0') nonzero = 1;
            remainder = (remainder * 10 + number[i] - '0') % 100;
        }
        if (!nonzero) break;
        printf("%d\n", prefix[remainder]);
    }
    return 0;
}
