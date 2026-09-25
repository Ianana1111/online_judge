#include <stdio.h>
#include <string.h>

static int digit_sum(int value) {
    int total = 0;
    while (value > 0) { total += value % 10; value /= 10; }
    return total;
}
int main(void) {
    char number[1001];
    while (scanf("%1000s", number) == 1 && strcmp(number, "0") != 0) {
        int total = 0;
        for (int i = 0; number[i] != '\0'; ++i) total += number[i] - '0';
        if (total % 9 != 0) printf("%s is not a multiple of 9.\n", number);
        else {
            int degree = 1;
            while (total != 9) { total = digit_sum(total); ++degree; }
            printf("%s is a multiple of 9 and has 9-degree %d.\n", number, degree);
        }
    }
    return 0;
}
