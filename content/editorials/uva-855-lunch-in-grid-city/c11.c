#include <stdio.h>
#include <stdlib.h>

static int compare(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}
int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    while (tests-- > 0) {
        int streets, avenues, friends;
        scanf("%d %d %d", &streets, &avenues, &friends);
        int *street = malloc((size_t)friends * sizeof(int));
        int *avenue = malloc((size_t)friends * sizeof(int));
        if (street == NULL || avenue == NULL) return 1;
        for (int i = 0; i < friends; ++i) scanf("%d %d", &street[i], &avenue[i]);
        qsort(street, friends, sizeof(int), compare);
        qsort(avenue, friends, sizeof(int), compare);
        int middle = (friends - 1) / 2;
        printf("(Street: %d, Avenue: %d)\n", street[middle], avenue[middle]);
        free(street);
        free(avenue);
    }
    return 0;
}
