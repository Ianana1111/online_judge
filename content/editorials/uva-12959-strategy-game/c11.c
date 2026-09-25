#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int players, rounds;
    while (scanf("%d %d", &players, &rounds) == 2 && (players != 0 || rounds != 0)) {
        int *total = calloc((size_t)players, sizeof(int));
        if (total == NULL) return 1;
        for (int round = 0; round < rounds; ++round)
            for (int player = 0; player < players; ++player) {
                int score;
                scanf("%d", &score);
                total[player] += score;
            }
        int winner = 0;
        for (int player = 1; player < players; ++player)
            if (total[player] >= total[winner]) winner = player;
        printf("%d\n", winner + 1);
        free(total);
    }
    return 0;
}
