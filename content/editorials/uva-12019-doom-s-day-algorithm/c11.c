#include <stdio.h>

int main(void) {
    const int days[12] = {31,28,31,30,31,30,31,31,30,31,30,31};
    const char *names[7] = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"};
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int month, day;
        scanf("%d %d", &month, &day);
        int offset = day - 1;
        for (int m = 1; m < month; ++m) offset += days[m - 1];
        puts(names[(5 + offset) % 7]);
    }
    return 0;
}
