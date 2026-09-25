#include <stdio.h>

int main(void) {
    int start, a, b, c;
    while (scanf("%d %d %d %d", &start, &a, &b, &c) == 4) {
        if (start == 0 && a == 0 && b == 0 && c == 0) break;
        int first = (start - a + 40) % 40;
        int second = (b - a + 40) % 40;
        int third = (b - c + 40) % 40;
        printf("%d\n", (120 + first + second + third) * 9);
    }
    return 0;
}
