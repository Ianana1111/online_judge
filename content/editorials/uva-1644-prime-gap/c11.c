#include <stdio.h>

int main(void) {
    static unsigned char prime[1299710];
    for (int i = 2; i <= 1299709; ++i) prime[i] = 1;
    for (int p = 2; p * p <= 1299709; ++p)
        if (prime[p])
            for (int multiple = p * p; multiple <= 1299709; multiple += p)
                prime[multiple] = 0;
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        if (prime[n]) { puts("0"); continue; }
        int lower = n - 1, upper = n + 1;
        while (!prime[lower]) --lower;
        while (!prime[upper]) ++upper;
        printf("%d\n", upper - lower);
    }
    return 0;
}
