#include <stdio.h>

int main(void) {
    int h1, m1, h2, m2;
    while (scanf("%d %d %d %d", &h1, &m1, &h2, &m2) == 4) {
        if (h1 == 0 && m1 == 0 && h2 == 0 && m2 == 0) break;
        int start = h1 * 60 + m1;
        int finish = h2 * 60 + m2;
        int wait = finish - start;
        if (wait <= 0) wait += 1440;
        printf("%d\n", wait);
    }
    return 0;
}
