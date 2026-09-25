#include <stdio.h>
#include <stdlib.h>

static int compare(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
int main(void) {
    int n;
    while (scanf("%d", &n) == 1) {
        int *values = malloc((size_t)n * sizeof(int));
        if (values == NULL) return 1;
        for (int i = 0; i < n; ++i) scanf("%d", &values[i]);
        qsort(values, n, sizeof(int), compare);
        int low = values[(n - 1) / 2], high = values[n / 2];
        int count = 0;
        for (int i = 0; i < n; ++i)
            if (values[i] >= low && values[i] <= high) ++count;
        printf("%d %d %d\n", low, count, high - low + 1);
        free(values);
    }
    return 0;
}
