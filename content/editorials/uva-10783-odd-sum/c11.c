#include <stdio.h>

int odd_prefix(int bound) {
    int count = (bound + 1) / 2;
    return count * count;
}

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        int low, high;
        scanf("%d %d", &low, &high);
        printf("Case %d: %d\n", case_number, odd_prefix(high) - odd_prefix(low - 1));
    }
    return 0;
}
