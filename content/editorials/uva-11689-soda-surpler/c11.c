#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int owned, found, cost;
        scanf("%d %d %d", &owned, &found, &cost);
        int empty = owned + found;
        int total = 0;
        while (empty >= cost) {
            int drinks = empty / cost;
            total += drinks;
            empty = empty % cost + drinks;
        }
        printf("%d\n", total);
    }
    return 0;
}
