#include <stdio.h>
static char grid[101][101];
static int qr[10000], qc[10000];
int main(void) {
    int rows, cols;
    while (scanf("%d %d", &rows, &cols) == 2 && rows) {
        for (int r = 0; r < rows; r++) scanf("%100s", grid[r]);
        int answer = 0;
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
            if (grid[r][c] != '@') continue;
            answer++; int front = 0, back = 0;
            qr[back] = r; qc[back++] = c; grid[r][c] = '*';
            while (front < back) {
                int y = qr[front], x = qc[front++];
                for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
                    int ny = y + dy, nx = x + dx;
                    if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || grid[ny][nx] != '@') continue;
                    grid[ny][nx] = '*'; qr[back] = ny; qc[back++] = nx;
                }
            }
        }
        printf("%d\n", answer);
    }
    return 0;
}
