#include <stdio.h>

static int gcd(int a, int b) {
    while (b != 0) { int remainder = a % b; a = b; b = remainder; }
    return a;
}

int main(void) {
    long long total[501] = {0};
    for (int right = 2; right <= 500; ++right) {
        total[right] = total[right - 1];
        for (int left = 1; left < right; ++left) total[right] += gcd(left, right);
    }
    int n;
    while (scanf("%d", &n) == 1 && n != 0) printf("%lld\n", total[n]);
    return 0;
}
