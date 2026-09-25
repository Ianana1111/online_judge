#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int count, position;
        scanf("%d", &count);
        int left = 100, right = -1;
        for (int i = 0; i < count; ++i) {
            scanf("%d", &position);
            if (position < left) left = position;
            if (position > right) right = position;
        }
        printf("%d\n", 2 * (right - left));
    }
    return 0;
}
