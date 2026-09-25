#include <stdio.h>

int main(void) {
    long long n;
    while (scanf("%lld", &n) == 1 && n != 0) {
        long long remaining = n, answer = n;
        for (long long prime = 2; prime * prime <= remaining; ++prime) {
            if (remaining % prime != 0) continue;
            answer -= answer / prime;
            while (remaining % prime == 0) remaining /= prime;
        }
        if (remaining > 1) answer -= answer / remaining;
        printf("%lld\n", answer);
    }
    return 0;
}
