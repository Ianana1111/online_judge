#include <stdio.h>
typedef struct { long long first, second; } Pair;
static Pair fibonacci(long long n, long long mod) {
    if (n == 0) { Pair base = {0, 1 % mod}; return base; }
    Pair half = fibonacci(n / 2, mod);
    long long a = half.first, b = half.second;
    long long c = a * ((2 * b - a + mod) % mod) % mod;
    long long d = (a * a + b * b) % mod;
    if (n % 2 == 0) { Pair result = {c, d}; return result; }
    Pair result = {d, (c + d) % mod}; return result;
}
int main(void) {
    long long n; int m;
    while (scanf("%lld %d", &n, &m) == 2) {
        long long mod = 1LL << m;
        printf("%lld\n", fibonacci(n, mod).first);
    }
    return 0;
}
