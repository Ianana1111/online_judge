#include <stdio.h>
#include <stdlib.h>

int main(void) {
    char line[1024];
    while (fgets(line, sizeof(line), stdin)) {
        char *cursor = line;
        int prime = (int)strtol(cursor, &cursor, 10);
        if (prime == 0) break;
        int value = 1;
        while (1) {
            int exponent = (int)strtol(cursor, &cursor, 10);
            for (int i = 0; i < exponent; ++i) value *= prime;
            while (*cursor == ' ') ++cursor;
            if (*cursor == '\n' || *cursor == '\r' || *cursor == '\0') break;
            prime = (int)strtol(cursor, &cursor, 10);
        }
        int rest = value - 1;
        int primes[16], exponents[16], size = 0;
        for (int divisor = 2; divisor * divisor <= rest; ++divisor) {
            int count = 0;
            while (rest % divisor == 0) {
                rest /= divisor;
                ++count;
            }
            if (count) {
                primes[size] = divisor;
                exponents[size++] = count;
            }
        }
        if (rest > 1) {
            primes[size] = rest;
            exponents[size++] = 1;
        }
        for (int i = size - 1; i >= 0; --i)
            printf("%s%d %d", i == size - 1 ? "" : " ", primes[i], exponents[i]);
        putchar('\n');
    }
    return 0;
}
