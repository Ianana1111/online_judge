#include <stdio.h>

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    puts("Lumberjacks:");
    while (tests-- > 0) {
        int values[10];
        for (int i = 0; i < 10; ++i) scanf("%d", &values[i]);
        int increasing = 1, decreasing = 1;
        for (int i = 1; i < 10; ++i) {
            if (values[i] <= values[i - 1]) increasing = 0;
            if (values[i] >= values[i - 1]) decreasing = 0;
        }
        puts(increasing || decreasing ? "Ordered" : "Unordered");
    }
    return 0;
}
