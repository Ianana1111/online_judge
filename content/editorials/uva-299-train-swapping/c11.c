#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int n, cars[50];
        scanf("%d", &n);
        for (int i = 0; i < n; ++i) scanf("%d", &cars[i]);
        int swaps = 0;
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                if (cars[i] > cars[j]) ++swaps;
            }
        }
        printf("Optimal train swapping takes %d swaps.\n", swaps);
    }
    return 0;
}
