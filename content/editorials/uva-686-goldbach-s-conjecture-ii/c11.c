#include <stdio.h>

int main(void) {
    unsigned char prime[32768] = {0};
    for (int i = 2; i < 32768; ++i) prime[i] = 1;
    for (int p = 2; p * p < 32768; ++p)
        if (prime[p])
            for (int multiple = p * p; multiple < 32768; multiple += p)
                prime[multiple] = 0;
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        int count = 0;
        for (int p = 2; p <= n / 2; ++p)
            if (prime[p] && prime[n - p]) ++count;
        printf("%d\n", count);
    }
    return 0;
}
