#include <stdio.h>
#include <stdlib.h>

static char grid[50][51];
static unsigned char die_seen[50][50], pip_seen[50][50];
static int queue[2500], cells[2500];
static const int dr[4] = {-1, 1, 0, 0};
static const int dc[4] = {0, 0, -1, 1};
static int compare(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int main(void) {
    int width, height, test = 0;
    while (scanf("%d %d", &width, &height) == 2 && (width || height)) {
        for (int r = 0; r < height; ++r) {
            scanf("%50s", grid[r]);
            for (int c = 0; c < width; ++c) die_seen[r][c] = pip_seen[r][c] = 0;
        }
        int answers[2500], count = 0;
        for (int sr = 0; sr < height; ++sr) for (int sc = 0; sc < width; ++sc) {
            if (grid[sr][sc] == '.' || die_seen[sr][sc]) continue;
            int head = 0, tail = 0;
            queue[tail++] = sr * width + sc;
            die_seen[sr][sc] = 1;
            while (head < tail) {
                int cell = queue[head++], r = cell / width, c = cell % width;
                cells[head - 1] = cell;
                for (int d = 0; d < 4; ++d) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
                    if (grid[nr][nc] == '.' || die_seen[nr][nc]) continue;
                    die_seen[nr][nc] = 1;
                    queue[tail++] = nr * width + nc;
                }
            }
            int dots = 0;
            for (int i = 0; i < tail; ++i) {
                int r = cells[i] / width, c = cells[i] % width;
                if (grid[r][c] != 'X' || pip_seen[r][c]) continue;
                ++dots;
                head = 0;
                int end = 0;
                queue[end++] = r * width + c;
                pip_seen[r][c] = 1;
                while (head < end) {
                    int current = queue[head++], x = current / width, y = current % width;
                    for (int d = 0; d < 4; ++d) {
                        int nx = x + dr[d], ny = y + dc[d];
                        if (nx < 0 || nx >= height || ny < 0 || ny >= width) continue;
                        if (grid[nx][ny] != 'X' || pip_seen[nx][ny]) continue;
                        pip_seen[nx][ny] = 1;
                        queue[end++] = nx * width + ny;
                    }
                }
            }
            answers[count++] = dots;
        }
        qsort(answers, count, sizeof(answers[0]), compare);
        printf("Throw %d\n", ++test);
        for (int i = 0; i < count; ++i) printf("%s%d", i ? " " : "", answers[i]);
        printf("\n\n");
    }
    return 0;
}
