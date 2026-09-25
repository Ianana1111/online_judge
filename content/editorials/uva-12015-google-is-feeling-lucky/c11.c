#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        char urls[10][10001];
        int scores[10];
        int best = -1;
        for (int i = 0; i < 10; ++i) {
            scanf("%10000s %d", urls[i], &scores[i]);
            if (scores[i] > best) best = scores[i];
        }
        printf("Case #%d:\n", case_number);
        for (int i = 0; i < 10; ++i) {
            if (scores[i] == best) puts(urls[i]);
        }
    }
    return 0;
}
