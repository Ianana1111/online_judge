#include <stdio.h>
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int n, best[31] = {0}; scanf("%d", &n);
        for (int i = 0; i < n; i++) {
            int price, weight; scanf("%d %d", &price, &weight);
            for (int capacity = 30; capacity >= weight; capacity--) {
                int candidate = best[capacity - weight] + price;
                if (candidate > best[capacity]) best[capacity] = candidate;
            }
        }
        int people, total = 0; scanf("%d", &people);
        while (people--) { int capacity; scanf("%d", &capacity); total += best[capacity]; }
        printf("%d\n", total);
    }
    return 0;
}
