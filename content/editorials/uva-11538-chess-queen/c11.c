#include <stdio.h>

int main(void) {
    long long rows, columns;
    while (scanf("%lld %lld", &rows, &columns) == 2) {
        if (rows == 0 && columns == 0) break;
        if (rows > columns) {
            long long temp = rows;
            rows = columns;
            columns = temp;
        }
        long long straight = rows * columns * (rows + columns - 2);
        long long diagonal = 4 * rows * (rows - 1) * (rows - 2) / 3
                           + 2 * (columns - rows + 1) * rows * (rows - 1);
        printf("%lld\n", straight + diagonal);
    }
    return 0;
}
