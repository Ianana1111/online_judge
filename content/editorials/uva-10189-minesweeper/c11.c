#include <stdio.h>
int main(void) {
    int rows, cols, field = 0;
    while (scanf("%d %d", &rows, &cols) == 2 && (rows || cols)) {
        char grid[100][101];
        for (int r = 0; r < rows; ++r) scanf("%100s", grid[r]);
        if (field) putchar('\n');
        printf("Field #%d:\n", ++field);
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) {
                if (grid[r][c] == '*') { putchar('*'); continue; }
                int count = 0;
                for (int dr = -1; dr <= 1; ++dr)
                    for (int dc = -1; dc <= 1; ++dc) {
                        int nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '*') ++count;
                    }
                putchar('0' + count);
            }
            putchar('\n');
        }
    }
    return 0;
}
