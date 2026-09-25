#include <stdio.h>
static int primes[25], composite[101];
int main(void) {
    int count = 0;
    for (int p = 2; p <= 100; p++) if (!composite[p]) {
        primes[count++] = p;
        for (int multiple = p * p; multiple <= 100; multiple += p) composite[multiple] = 1;
    }
    int n;
    while (scanf("%d", &n) == 1 && n) {
        printf("%3d! =", n); int column = 0;
        for (int i = 0; i < count && primes[i] <= n; i++) {
            int exponent = 0;
            for (int quotient = n / primes[i]; quotient > 0; quotient /= primes[i]) exponent += quotient;
            if (column == 15) { printf("\n      "); column = 0; }
            printf("%3d", exponent); column++;
        }
        putchar('\n');
    }
    return 0;
}
