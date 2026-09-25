#include <stdio.h>
#include <string.h>

int main(void) {
    char number[1002];
    while (scanf("%1000s", number) == 1 && strcmp(number, "0") != 0) {
        int remainder = 0;
        for (int i = 0; number[i] != '\0'; ++i)
            remainder = (remainder * 10 + number[i] - '0') % 11;
        printf("%s is %sa multiple of 11.\n", number, remainder == 0 ? "" : "not ");
    }
    return 0;
}
