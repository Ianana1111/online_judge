#include <stdio.h>
static unsigned long long value[9], path[9], answer[512][9];
static int up[9], n, best, found;
static void visit(int start, int remaining, int depth) {
    if (remaining == 0) {
        for (int j = 0; j < depth; j++) answer[found][j] = path[j];
        found++; return;
    }
    for (int i = start; i < n; i++) {
        if (up[i] == remaining && (depth == 0 || value[i] > path[depth - 1])) {
            path[depth] = value[i];
            visit(i + 1, remaining - 1, depth + 1);
        }
    }
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        scanf("%d", &n);
        for (int i = 0; i < n; i++) scanf("%llu", &value[i]);
        best = 0;
        for (int i = n - 1; i >= 0; i--) {
            up[i] = 1;
            for (int j = i + 1; j < n; j++)
                if (value[j] > value[i] && up[j] + 1 > up[i]) up[i] = up[j] + 1;
            if (up[i] > best) best = up[i];
        }
        found = 0; visit(0, best, 0);
        printf("%d\n", found);
        for (int i = 0; i < found; i++) {
            for (int j = 0; j < best; j++) {
                if (j) putchar(' ');
                printf("%llu", answer[i][j]);
            }
            putchar('\n');
        }
    }
    return 0;
}
