#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        int *deck = malloc(sizeof(int) * (size_t)(2 * n));
        int head = 0, tail = 0;
        for (int card = 1; card <= n; ++card) deck[tail++] = card;
        fputs("Discarded cards:", stdout);
        int first = 1;
        while (tail - head >= 2) {
            printf(first ? " %d" : ", %d", deck[head++]);
            first = 0;
            deck[tail++] = deck[head++];
        }
        printf("\nRemaining card: %d\n", deck[head]);
        free(deck);
    }
    return 0;
}
