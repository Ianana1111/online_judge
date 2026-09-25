#include <stdio.h>
#include <string.h>
static long long choose[27][6];
int main(void) {
    for (int n = 0; n <= 26; n++) {
        choose[n][0] = 1;
        for (int k = 1; k <= 5 && k <= n; k++)
            choose[n][k] = n ? choose[n - 1][k - 1] + choose[n - 1][k] : 0;
    }
    char word[64];
    while (scanf("%63s", word) == 1) {
        int length = strlen(word), valid = length <= 5;
        for (int i = 0; i < length; i++) {
            if (word[i] < 'a' || word[i] > 'z') valid = 0;
            if (i && word[i] <= word[i - 1]) valid = 0;
        }
        if (!valid) { puts("0"); continue; }
        long long answer = 1;
        for (int len = 1; len < length; len++) answer += choose[26][len];
        int previous = -1;
        for (int i = 0; i < length; i++) {
            int current = word[i] - 'a', remaining = length - i - 1;
            for (int candidate = previous + 1; candidate < current; candidate++)
                answer += choose[25 - candidate][remaining];
            previous = current;
        }
        printf("%lld\n", answer);
    }
    return 0;
}
