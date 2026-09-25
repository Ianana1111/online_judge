#include <stdio.h>
static char composite[10002];
static int primes[1230], prefix[10002];
int main(void) {
    int count = 0;
    for (int i = 2; i <= 10001; i++) if (!composite[i]) {
        primes[count++] = i;
        if (i <= 100) for (int j = i * i; j <= 10001; j += i) composite[j] = 1;
    }
    for (int n = 0; n <= 10000; n++) {
        int value = n * n + n + 41, prime = 1;
        for (int i = 0; i < count && 1LL * primes[i] * primes[i] <= value; i++) {
            if (value % primes[i] == 0) { prime = 0; break; }
        }
        prefix[n + 1] = prefix[n] + prime;
    }
    int a, b;
    while (scanf("%d %d", &a, &b) == 2) {
        long long numerator = 10000LL * (prefix[b + 1] - prefix[a]);
        long long denominator = b - a + 1;
        long long hundredths = (2 * numerator + denominator) / (2 * denominator);
        printf("%lld.%02lld\n", hundredths / 100, hundredths % 100);
    }
    return 0;
}
