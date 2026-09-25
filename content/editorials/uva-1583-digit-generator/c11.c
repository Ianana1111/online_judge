#include <stdio.h>

int main(void) {
    int smallest[100001] = {0};
    for (int value = 1; value <= 100000; ++value) {
        int target = value;
        for (int digits = value; digits > 0; digits /= 10) target += digits % 10;
        if (target <= 100000 && smallest[target] == 0) smallest[target] = value;
    }
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int target;
        scanf("%d", &target);
        printf("%d\n", smallest[target]);
    }
    return 0;
}
