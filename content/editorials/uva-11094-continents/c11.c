#include <stdio.h>
#include <string.h>
static char grid[21][21], seen[21][21];
static int rows, cols;
static int flood(int sy, int sx, char land) {
    int qy[400], qx[400], front = 0, back = 0;
    qy[back] = sy; qx[back++] = sx; seen[sy][sx] = 1;
    while (front < back) {
        int y = qy[front], x = qx[front++];
        const int dy[4] = {1,-1,0,0}, dx[4] = {0,0,1,-1};
        for (int d = 0; d < 4; d++) {
            int ny = y + dy[d], nx = (x + dx[d] + cols) % cols;
            if (ny < 0 || ny >= rows || seen[ny][nx] || grid[ny][nx] != land) continue;
            seen[ny][nx] = 1; qy[back] = ny; qx[back++] = nx;
        }
    }
    return back;
}
int main(void) {
    while (scanf("%d %d", &rows, &cols) == 2) {
        for (int y = 0; y < rows; y++) scanf("%20s", grid[y]);
        int sy, sx; scanf("%d %d", &sy, &sx);
        char land = grid[sy][sx]; memset(seen, 0, sizeof(seen));
        flood(sy, sx, land); int best = 0;
        for (int y = 0; y < rows; y++) for (int x = 0; x < cols; x++) {
            if (!seen[y][x] && grid[y][x] == land) {
                int size = flood(y, x, land);
                if (size > best) best = size;
            }
        }
        printf("%d\n", best);
    }
    return 0;
}
