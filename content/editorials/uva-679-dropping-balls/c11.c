#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int depth, number, node = 1;
        scanf("%d %d", &depth, &number);
        for (int level = 1; level < depth; ++level) {
            if (number % 2 != 0) {
                node = node * 2;
                number = (number + 1) / 2;
            } else {
                node = node * 2 + 1;
                number /= 2;
            }
        }
        printf("%d\n", node);
    }
    return 0;
}
