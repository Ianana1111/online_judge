#include <stdio.h>

int main(void) {
    static unsigned char prime[1000000];
    for (int i = 2; i < 1000000; ++i) prime[i] = 1;
    for (int p = 2; p * p < 1000000; ++p)
        if (prime[p])
            for (int multiple = p * p; multiple < 1000000; multiple += p)
                prime[multiple] = 0;
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        int answer = 0;
        for (int a = 3; a <= n / 2; a += 2)
            if (prime[a] && prime[n - a]) { answer = a; break; }
        if (answer) printf("%d = %d + %d\n", n, answer, n - answer);
        else puts("Goldbach's conjecture is wrong.");
    }
    return 0;
}
