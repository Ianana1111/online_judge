#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int compare(const void *left, const void *right) {
    const char *a = *(const char *const *)left;
    const char *b = *(const char *const *)right;
    size_t length_a = strlen(a), length_b = strlen(b);
    for (size_t i = 0; i < length_a + length_b; ++i) {
        char ab = i < length_a ? a[i] : b[i - length_a];
        char ba = i < length_b ? b[i] : a[i - length_b];
        if (ab != ba) return ab > ba ? -1 : 1;
    }
    return 0;
}
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        char **values = malloc((size_t)n * sizeof(char *));
        if (values == NULL) return 1;
        for (int i = 0; i < n; ++i) {
            values[i] = malloc(1001);
            if (values[i] == NULL) return 1;
            scanf("%1000s", values[i]);
        }
        qsort(values, n, sizeof(char *), compare);
        for (int i = 0; i < n; ++i) { fputs(values[i], stdout); free(values[i]); }
        putchar('\n');
        free(values);
    }
    return 0;
}
