#include <stdio.h>
#include <stdlib.h>

static int compare(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int main(void) {
    int n, limit, rate;
    while (scanf("%d %d %d", &n, &limit, &rate) == 3 && n != 0) {
        int *morning = malloc((size_t)n * sizeof(int));
        int *evening = malloc((size_t)n * sizeof(int));
        if (morning == NULL || evening == NULL) return 1;
        for (int i = 0; i < n; ++i) scanf("%d", &morning[i]);
        for (int i = 0; i < n; ++i) scanf("%d", &evening[i]);
        qsort(morning, n, sizeof(int), compare);
        qsort(evening, n, sizeof(int), compare);
        long long cost = 0;
        for (int i = 0; i < n; ++i) {
            int extra = morning[i] + evening[n - 1 - i] - limit;
            if (extra > 0) cost += (long long)extra * rate;
        }
        printf("%lld\n", cost);
        free(morning);
        free(evening);
    }
    return 0;
}
