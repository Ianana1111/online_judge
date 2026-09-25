#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        char answer[100001];
        scanf("%100000s", answer);
        int streak = 0;
        int total = 0;
        for (int i = 0; answer[i] != '\0'; ++i) {
            if (answer[i] == 'O') {
                ++streak;
                total += streak;
            } else {
                streak = 0;
            }
        }
        printf("%d\n", total);
    }
    return 0;
}
