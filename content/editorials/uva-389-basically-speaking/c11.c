#include <stdio.h>
#include <string.h>
static const char digits[] = "0123456789ABCDEF";
int main(void) {
    char text[10001]; int from, to;
    while (scanf("%10000s %d %d", text, &from, &to) == 3) {
        long long modulus = 1, value = 0;
        for (int i = 0; i < 7; i++) modulus *= to;
        for (int i = 0; text[i]; i++) {
            const char *found = strchr(digits, text[i]);
            value = (value * from + (found - digits)) % modulus;
        }
        char output[8]; output[7] = 0;
        for (int i = 6; i >= 0; i--) { output[i] = digits[value % to]; value /= to; }
        puts(output);
    }
    return 0;
}
