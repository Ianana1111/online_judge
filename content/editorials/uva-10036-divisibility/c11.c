#include <stdio.h>
#include <string.h>
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int n, k, value; scanf("%d %d", &n, &k);
        char possible[101] = {0}, next[101];
        scanf("%d", &value);
        possible[(value % k + k) % k] = 1;
        for (int i = 1; i < n; i++) {
            scanf("%d", &value); value = (value % k + k) % k;
            memset(next, 0, sizeof(next));
            for (int r = 0; r < k; r++) if (possible[r]) {
                next[(r + value) % k] = 1;
                next[(r - value + k) % k] = 1;
            }
            memcpy(possible, next, sizeof(next));
        }
        puts(possible[0] ? "Divisible" : "Not divisible");
    }
    return 0;
}
