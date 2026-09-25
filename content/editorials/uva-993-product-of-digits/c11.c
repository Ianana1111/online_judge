#include <stdio.h>
#include <string.h>
static int best_length;
static char best[40];
static void sort_digits(char *digits, int length) {
    for (int i = 0; i < length; i++) for (int j = i + 1; j < length; j++)
        if (digits[j] < digits[i]) { char tmp = digits[i]; digits[i] = digits[j]; digits[j] = tmp; }
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        long long n; scanf("%lld", &n);
        if (n < 2) { printf("%lld\n", n); continue; }
        int exponent[4] = {0}, prime[4] = {2,3,5,7};
        long long rest = n;
        for (int i = 0; i < 4; i++) while (rest % prime[i] == 0) { exponent[i]++; rest /= prime[i]; }
        if (rest != 1) { puts("-1"); continue; }
        best_length = 100;
        for (int sixes = 0; sixes <= exponent[0] && sixes <= exponent[1]; sixes++) {
            int twos = exponent[0] - sixes, threes = exponent[1] - sixes;
            char digits[40]; int length = 0;
            for (int i = 0; i < sixes; i++) digits[length++] = '6';
            for (int i = 0; i < exponent[2]; i++) digits[length++] = '5';
            for (int i = 0; i < exponent[3]; i++) digits[length++] = '7';
            for (int i = 0; i < twos / 3; i++) digits[length++] = '8';
            twos %= 3;
            if (twos) digits[length++] = twos == 2 ? '4' : '2';
            for (int i = 0; i < threes / 2; i++) digits[length++] = '9';
            if (threes % 2) digits[length++] = '3';
            sort_digits(digits, length); digits[length] = 0;
            if (length < best_length || (length == best_length && strcmp(digits, best) < 0)) {
                best_length = length; strcpy(best, digits);
            }
        }
        puts(best);
    }
    return 0;
}
