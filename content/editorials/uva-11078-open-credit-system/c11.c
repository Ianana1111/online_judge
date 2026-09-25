#include <limits.h>
#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int n, highest;
        scanf("%d %d", &n, &highest);
        int answer = INT_MIN;
        for (int i = 1; i < n; ++i) {
            int current;
            scanf("%d", &current);
            if (highest - current > answer) answer = highest - current;
            if (current > highest) highest = current;
        }
        printf("%d\n", answer);
    }
    return 0;
}
