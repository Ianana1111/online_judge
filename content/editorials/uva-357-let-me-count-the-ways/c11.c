#include <stdio.h>

int main(void) {
    const int limit = 30000;
    const int coins[5] = {1, 5, 10, 25, 50};
    unsigned long long ways[30001] = {0};
    ways[0] = 1;
    for (int i = 0; i < 5; ++i)
        for (int amount = coins[i]; amount <= limit; ++amount)
            ways[amount] += ways[amount - coins[i]];
    int amount;
    while (scanf("%d", &amount) == 1) {
        if (ways[amount] == 1)
            printf("There is only 1 way to produce %d cents change.\n", amount);
        else
            printf("There are %llu ways to produce %d cents change.\n", ways[amount], amount);
    }
    return 0;
}
