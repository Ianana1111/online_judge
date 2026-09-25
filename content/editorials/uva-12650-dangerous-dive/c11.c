#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, returned;
    while (scanf("%d %d", &n, &returned) == 2) {
        int *present = calloc((size_t)n + 1, sizeof(int));
        if (present == NULL) return 1;
        for (int i = 0; i < returned; ++i) {
            int id;
            scanf("%d", &id);
            present[id] = 1;
        }
        int missing = 0;
        for (int id = 1; id <= n; ++id) {
            if (!present[id]) {
                printf("%d ", id);
                missing = 1;
            }
        }
        if (!missing) putchar('*');
        putchar('\n');
        free(present);
    }
    return 0;
}
