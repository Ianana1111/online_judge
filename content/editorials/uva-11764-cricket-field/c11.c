#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        int n, previous;
        scanf("%d %d", &n, &previous);
        int high = 0, low = 0;
        for (int i = 1; i < n; ++i) {
            int current;
            scanf("%d", &current);
            if (current > previous) ++high;
            else if (current < previous) ++low;
            previous = current;
        }
        printf("Case %d: %d %d\n", case_number, high, low);
    }
    return 0;
}
