#include <stdint.h>
#include <stdio.h>
#include <string.h>

#define WORDS 704

static uint64_t possible[51][WORDS];

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 0; tc < tests; ++tc) {
        int n, weights[100], total = 0;
        scanf("%d", &n);
        for (int i = 0; i < n; ++i) {
            scanf("%d", &weights[i]);
            total += weights[i];
        }
        int team_size = n / 2;
        memset(possible, 0, sizeof(possible));
        possible[0][0] = 1;
        for (int i = 0; i < n; ++i) {
            int word_shift = weights[i] / 64;
            int bit_shift = weights[i] % 64;
            int largest = i + 1 < team_size ? i + 1 : team_size;
            for (int count = largest; count >= 1; --count) {
                for (int word = WORDS - 1; word >= word_shift; --word) {
                    uint64_t shifted = possible[count - 1][word - word_shift] << bit_shift;
                    if (bit_shift && word > word_shift)
                        shifted |= possible[count - 1][word - word_shift - 1] >> (64 - bit_shift);
                    possible[count][word] |= shifted;
                }
            }
        }
        int best = total + 1, low = 0, high = total;
        for (int sum = 0; sum <= total; ++sum) {
            if (!(possible[team_size][sum / 64] & (UINT64_C(1) << (sum % 64)))) continue;
            int diff = total - 2 * sum;
            if (diff < 0) diff = -diff;
            if (diff < best) {
                best = diff;
                low = sum < total - sum ? sum : total - sum;
                high = total - low;
            }
        }
        if (tc) putchar('\n');
        printf("%d %d\n", low, high);
    }
    return 0;
}
