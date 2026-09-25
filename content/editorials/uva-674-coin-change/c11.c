#include <stdio.h>

int main(void) {
    const int limit = 7489;
    const int coins[5] = {1, 5, 10, 25, 50};
    unsigned long long ways[7490] = {0};
    ways[0] = 1;
    for (int i = 0; i < 5; ++i) {
        for (int amount = coins[i]; amount <= limit; ++amount) {
            ways[amount] += ways[amount - coins[i]];
        }
    }
    int amount;
    while (scanf("%d", &amount) == 1) printf("%llu\n", ways[amount]);
    return 0;
}
