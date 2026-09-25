#include <stdio.h>
#include <string.h>

static char image[100][101];
static int queue[10000];

int main(void) {
    char line[256], name[128], color;
    int width = 0, height = 0;
    while (fgets(line, sizeof(line), stdin)) {
        char op;
        if (sscanf(line, " %c", &op) != 1) continue;
        if (op == 'X') break;
        if (op == 'I') {
            sscanf(line, " %c %d %d", &op, &width, &height);
            for (int y = 0; y < height; ++y) {
                memset(image[y], 'O', width);
                image[y][width] = '\0';
            }
        } else if (op == 'C') {
            for (int y = 0; y < height; ++y) memset(image[y], 'O', width);
        } else if (op == 'S') {
            sscanf(line, " %c %127s", &op, name);
            puts(name);
            for (int y = 0; y < height; ++y) puts(image[y]);
        } else if (op == 'L') {
            int x, y;
            sscanf(line, " %c %d %d %c", &op, &x, &y, &color);
            image[y - 1][x - 1] = color;
        } else if (op == 'V') {
            int x, y1, y2;
            sscanf(line, " %c %d %d %d %c", &op, &x, &y1, &y2, &color);
            if (y1 > y2) { int temp = y1; y1 = y2; y2 = temp; }
            for (int y = y1; y <= y2; ++y) image[y - 1][x - 1] = color;
        } else if (op == 'H') {
            int x1, x2, y;
            sscanf(line, " %c %d %d %d %c", &op, &x1, &x2, &y, &color);
            if (x1 > x2) { int temp = x1; x1 = x2; x2 = temp; }
            for (int x = x1; x <= x2; ++x) image[y - 1][x - 1] = color;
        } else if (op == 'K') {
            int x1, y1, x2, y2;
            sscanf(line, " %c %d %d %d %d %c", &op, &x1, &y1, &x2, &y2, &color);
            for (int y = y1; y <= y2; ++y)
                for (int x = x1; x <= x2; ++x) image[y - 1][x - 1] = color;
        } else if (op == 'F') {
            int x, y;
            sscanf(line, " %c %d %d %c", &op, &x, &y, &color);
            --x; --y;
            char old = image[y][x];
            if (old == color) continue;
            int head = 0, tail = 0;
            queue[tail++] = y * width + x;
            image[y][x] = color;
            while (head < tail) {
                int cell = queue[head++], cy = cell / width, cx = cell % width;
                const int dy[4] = {-1, 1, 0, 0}, dx[4] = {0, 0, -1, 1};
                for (int d = 0; d < 4; ++d) {
                    int ny = cy + dy[d], nx = cx + dx[d];
                    if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
                    if (image[ny][nx] != old) continue;
                    image[ny][nx] = color;
                    queue[tail++] = ny * width + nx;
                }
            }
        }
    }
    return 0;
}
