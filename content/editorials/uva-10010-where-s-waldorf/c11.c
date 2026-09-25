#include <stdio.h>
#include <ctype.h>
#include <string.h>
static char grid[50][51];
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 0; tc < tests; tc++) {
        int rows, cols; scanf("%d %d", &rows, &cols);
        for (int r = 0; r < rows; r++) {
            scanf("%50s", grid[r]);
            for (int c = 0; c < cols; c++) grid[r][c] = tolower((unsigned char)grid[r][c]);
        }
        if (tc) putchar('\n');
        int queries; scanf("%d", &queries);
        while (queries--) {
            char word[51]; scanf("%50s", word);
            int length = strlen(word), found = 0;
            for (int i = 0; i < length; i++) word[i] = tolower((unsigned char)word[i]);
            for (int r = 0; r < rows && !found; r++) for (int c = 0; c < cols && !found; c++) {
                for (int dr = -1; dr <= 1 && !found; dr++) for (int dc = -1; dc <= 1 && !found; dc++) {
                    if (dr == 0 && dc == 0) continue;
                    int okay = 1;
                    for (int k = 0; k < length; k++) {
                        int nr = r + k * dr, nc = c + k * dc;
                        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != word[k]) {
                            okay = 0; break;
                        }
                    }
                    if (okay) { printf("%d %d\n", r + 1, c + 1); found = 1; }
                }
            }
        }
    }
    return 0;
}
