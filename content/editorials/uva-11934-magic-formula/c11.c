#include <stdio.h>

int main(void) {
    long long a, b, c, divisor, limit;
    while (scanf("%lld %lld %lld %lld %lld", &a, &b, &c, &divisor, &limit) == 5) {
        if (a == 0 && b == 0 && c == 0 && divisor == 0 && limit == 0) break;
        int answer = 0;
        for (long long x = 0; x <= limit; ++x) {
            long long value = (a * x + b) * x + c;
            if (value % divisor == 0) ++answer;
        }
        printf("%d\n", answer);
    }
    return 0;
}
