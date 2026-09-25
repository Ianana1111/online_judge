#include <stdio.h>
static int grid[100][100];
int main(void) {
    int rows, cols;
    while (scanf("%d %d", &rows, &cols) == 2 && (rows || cols)) {
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) scanf("%d", &grid[r][c]);
        int best = 0;
        for (int top = 0; top < rows; top++) {
            char clear[100];
            for (int c = 0; c < cols; c++) clear[c] = 1;
            for (int bottom = top; bottom < rows; bottom++) {
                int width = 0;
                for (int c = 0; c < cols; c++) {
                    clear[c] = clear[c] && grid[bottom][c] == 0;
                    width = clear[c] ? width + 1 : 0;
                    int area = width * (bottom - top + 1);
                    if (area > best) best = area;
                }
            }
        }
        printf("%d\n", best);
    }
    return 0;
}
