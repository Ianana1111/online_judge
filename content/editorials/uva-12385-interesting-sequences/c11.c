#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int n;
        scanf("%d", &n);
        int *seen = calloc(100001, sizeof(int));
        if (seen == NULL) return 1;
        int epoch = 1, answer = 0;
        for (int i = 0; i < n; ++i) {
            int value;
            scanf("%d", &value);
            if (seen[value] == epoch) { ++answer; ++epoch; }
            seen[value] = epoch;
        }
        printf("%d\n", answer);
        free(seen);
    }
    return 0;
}
