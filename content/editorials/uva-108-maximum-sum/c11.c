#include <stdio.h>
#include <limits.h>
static int grid[100][100];
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n) {
        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) scanf("%d", &grid[r][c]);
        int best = INT_MIN;
        for (int top = 0; top < n; top++) {
            int columns[100] = {0};
            for (int bottom = top; bottom < n; bottom++) {
                for (int c = 0; c < n; c++) columns[c] += grid[bottom][c];
                int ending = columns[0];
                if (ending > best) best = ending;
                for (int c = 1; c < n; c++) {
                    int extend = ending + columns[c];
                    ending = columns[c] > extend ? columns[c] : extend;
                    if (ending > best) best = ending;
                }
            }
        }
        printf("%d\n", best);
    }
    return 0;
}
