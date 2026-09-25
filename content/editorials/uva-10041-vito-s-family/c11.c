#include <stdio.h>
#include <stdlib.h>

static int compare(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int count;
        scanf("%d", &count);
        int *positions = malloc((size_t)count * sizeof(int));
        if (positions == NULL) return 1;
        for (int i = 0; i < count; ++i) scanf("%d", &positions[i]);
        qsort(positions, count, sizeof(int), compare);
        int home = positions[count / 2];
        long long total = 0;
        for (int i = 0; i < count; ++i) total += abs(positions[i] - home);
        printf("%lld\n", total);
        free(positions);
    }
    return 0;
}
