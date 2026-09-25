#include <stdio.h>

int main(void) {
    long long ways[11] = {1};
    for (int pairs = 1; pairs <= 10; ++pairs)
        for (int inside = 0; inside < pairs; ++inside)
            ways[pairs] += ways[inside] * ways[pairs - 1 - inside];
    int n, first = 1;
    while (scanf("%d", &n) == 1) {
        if (!first) putchar('\n');
        first = 0;
        printf("%lld\n", ways[n]);
    }
    return 0;
}
