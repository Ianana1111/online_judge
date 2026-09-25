#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int rounds;
        unsigned long long team;
        scanf("%d %llu", &rounds, &team);
        if (team == 0) { puts("1 1"); continue; }
        int ones = 0;
        for (unsigned long long value = team; value != 0; value >>= 1)
            ones += (int)(value & 1);
        unsigned long long block = team & (~team + 1);
        unsigned long long worst = (1ULL << rounds) - block + 1;
        printf("%d %llu\n", ones + 1, worst);
    }
    return 0;
}
