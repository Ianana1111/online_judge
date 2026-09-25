#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int stones, count;
    while (scanf("%d %d", &stones, &count) == 2) {
        long long moves[10];
        for (int i = 0; i < count; ++i) scanf("%lld", &moves[i]);
        unsigned char *winning = calloc((size_t)stones + 1, 1);
        if (winning == NULL) return 1;
        for (int remaining = 1; remaining <= stones; ++remaining) {
            for (int i = 0; i < count; ++i) {
                if (moves[i] <= remaining && !winning[remaining - moves[i]]) {
                    winning[remaining] = 1;
                    break;
                }
            }
        }
        puts(winning[stones] ? "Stan wins" : "Ollie wins");
        free(winning);
    }
    return 0;
}
