#include <stdio.h>

int main(void) {
    long long ways[51] = {0};
    ways[0] = ways[1] = 1;
    for (int width = 2; width <= 50; ++width)
        ways[width] = ways[width - 1] + ways[width - 2];
    int width;
    while (scanf("%d", &width) == 1 && width != 0)
        printf("%lld\n", ways[width]);
    return 0;
}
