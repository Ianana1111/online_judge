#include <stdio.h>
#include <string.h>
static char grid[100][101], next[100][101];
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 0; tc < tests; tc++) {
        int rows, cols, days; scanf("%d %d %d", &rows, &cols, &days);
        for (int r = 0; r < rows; r++) scanf("%100s", grid[r]);
        int dr[4] = {-1,1,0,0}, dc[4] = {0,0,-1,1};
        while (days--) {
            for (int r = 0; r < rows; r++) strcpy(next[r], grid[r]);
            for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
                char enemy = grid[r][c] == 'R' ? 'P' : grid[r][c] == 'P' ? 'S' : 'R';
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == enemy)
                        next[r][c] = enemy;
                }
            }
            for (int r = 0; r < rows; r++) strcpy(grid[r], next[r]);
        }
        if (tc) putchar('\n');
        for (int r = 0; r < rows; r++) puts(grid[r]);
    }
    return 0;
}
