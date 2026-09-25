#include <stdio.h>
#include <string.h>
static int a[10][10];
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 1; tc <= tests; tc++) {
        int n; scanf("%d", &n);
        char row[11];
        for (int r = 0; r < n; r++) {
            scanf("%10s", row);
            for (int c = 0; c < n; c++) a[r][c] = row[c] - '0';
        }
        int commands; scanf("%d", &commands);
        while (commands--) {
            char op[16]; scanf("%15s", op);
            if (!strcmp(op, "row") || !strcmp(op, "col")) {
                int x, y; scanf("%d %d", &x, &y); x--; y--;
                if (!strcmp(op, "row")) {
                    for (int c = 0; c < n; c++) { int tmp = a[x][c]; a[x][c] = a[y][c]; a[y][c] = tmp; }
                } else {
                    for (int r = 0; r < n; r++) { int tmp = a[r][x]; a[r][x] = a[r][y]; a[r][y] = tmp; }
                }
            } else if (!strcmp(op, "transpose")) {
                for (int r = 0; r < n; r++) for (int c = r + 1; c < n; c++) {
                    int tmp = a[r][c]; a[r][c] = a[c][r]; a[c][r] = tmp;
                }
            } else {
                int delta = !strcmp(op, "inc") ? 1 : 9;
                for (int r = 0; r < n; r++) for (int c = 0; c < n; c++)
                    a[r][c] = (a[r][c] + delta) % 10;
            }
        }
        printf("Case #%d\n", tc);
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) putchar('0' + a[r][c]);
            putchar('\n');
        }
        putchar('\n');
    }
    return 0;
}
