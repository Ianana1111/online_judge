#include <stdio.h>

static int binary_value(const char *bits) {
    int result = 0;
    for (int i = 0; bits[i] != '\0'; ++i) result = result * 2 + bits[i] - '0';
    return result;
}
static int gcd(int a, int b) {
    while (b != 0) { int remainder = a % b; a = b; b = remainder; }
    return a;
}
int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        char first[31], second[31];
        scanf("%30s %30s", first, second);
        int possible = gcd(binary_value(first), binary_value(second)) > 1;
        printf("Pair #%d: %s\n", case_number,
               possible ? "All you need is love!" : "Love is not all you need!");
    }
    return 0;
}
