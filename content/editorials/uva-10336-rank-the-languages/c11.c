#include <stdio.h>
#include <stdlib.h>
static char grid[1001][1001];
static int qr[1000000], qc[1000000], count[26];
static int compare(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    if (count[x] != count[y]) return count[y] - count[x];
    return x - y;
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 1; tc <= tests; tc++) {
        int rows, cols; scanf("%d %d", &rows, &cols);
        for (int r = 0; r < rows; r++) scanf("%1000s", grid[r]);
        for (int i = 0; i < 26; i++) count[i] = 0;
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '.') continue;
            char language = grid[r][c]; count[language - 'a']++;
            int front = 0, back = 0;
            qr[back] = r; qc[back++] = c; grid[r][c] = '.';
            while (front < back) {
                int y = qr[front], x = qc[front++];
                const int dy[4] = {1,-1,0,0}, dx[4] = {0,0,1,-1};
                for (int d = 0; d < 4; d++) {
                    int ny = y + dy[d], nx = x + dx[d];
                    if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || grid[ny][nx] != language) continue;
                    grid[ny][nx] = '.'; qr[back] = ny; qc[back++] = nx;
                }
            }
        }
        int order[26], size = 0;
        for (int i = 0; i < 26; i++) if (count[i]) order[size++] = i;
        qsort(order, size, sizeof(int), compare);
        printf("World #%d\n", tc);
        for (int i = 0; i < size; i++) printf("%c: %d\n", 'a' + order[i], count[order[i]]);
    }
    return 0;
}
