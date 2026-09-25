#include <stdio.h>
#include <stdlib.h>

static int compare(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
int main(void) {
    char first[101], second[101];
    while (scanf("%100s %100s", first, second) == 2) {
        int count_a[26] = {0}, count_b[26] = {0};
        for (int i = 0; first[i] != '\0'; ++i) ++count_a[first[i] - 'A'];
        for (int i = 0; second[i] != '\0'; ++i) ++count_b[second[i] - 'A'];
        qsort(count_a, 26, sizeof(int), compare);
        qsort(count_b, 26, sizeof(int), compare);
        int same = 1;
        for (int i = 0; i < 26; ++i) if (count_a[i] != count_b[i]) same = 0;
        puts(same ? "YES" : "NO");
    }
    return 0;
}
