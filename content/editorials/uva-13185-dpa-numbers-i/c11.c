#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int number, sum = 0;
        scanf("%d", &number);
        for (int divisor = 1; divisor < number; ++divisor)
            if (number % divisor == 0) sum += divisor;
        if (sum < number) puts("deficient");
        else if (sum == number) puts("perfect");
        else puts("abundant");
    }
    return 0;
}
