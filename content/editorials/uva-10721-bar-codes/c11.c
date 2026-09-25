#include <stdio.h>

int main(void) {
    int n, bars, maximum;
    while (scanf("%d %d %d", &n, &bars, &maximum) == 3) {
        long long ways[51][51] = {{0}};
        ways[0][0] = 1;
        for (int used = 1; used <= bars; ++used)
            for (int total = 1; total <= n; ++total)
                for (int width = 1; width <= maximum && width <= total; ++width)
                    ways[used][total] += ways[used - 1][total - width];
        printf("%lld\n", ways[bars][n]);
    }
    return 0;
}
