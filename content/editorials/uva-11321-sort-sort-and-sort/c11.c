#include <stdio.h>
#include <stdlib.h>
static int modulus;
static int compare(const void *left, const void *right) {
    long long a = *(const long long *)left, b = *(const long long *)right;
    long long ra = a % modulus, rb = b % modulus;
    if (ra != rb) return ra < rb ? -1 : 1;
    int odd_a = a % 2 != 0, odd_b = b % 2 != 0;
    if (odd_a != odd_b) return odd_a ? -1 : 1;
    if (a == b) return 0;
    return odd_a ? (a > b ? -1 : 1) : (a < b ? -1 : 1);
}
int main(void) {
    int n;
    while (scanf("%d %d", &n, &modulus) == 2) {
        printf("%d %d\n", n, modulus);
        if (n == 0 && modulus == 0) break;
        long long *values = malloc(n * sizeof(long long));
        for (int i = 0; i < n; i++) scanf("%lld", &values[i]);
        qsort(values, n, sizeof(long long), compare);
        for (int i = 0; i < n; i++) printf("%lld\n", values[i]);
        free(values);
    }
    return 0;
}
