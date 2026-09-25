#include <stdio.h>

int main(void) {
    int queries;
    while (scanf("%d", &queries) == 1 && queries != 0) {
        int center_x, center_y;
        scanf("%d %d", &center_x, &center_y);
        for (int i = 0; i < queries; ++i) {
            int x, y;
            scanf("%d %d", &x, &y);
            if (x == center_x || y == center_y) puts("divisa");
            else printf("%c%c\n", y > center_y ? 'N' : 'S', x > center_x ? 'E' : 'O');
        }
    }
    return 0;
}
