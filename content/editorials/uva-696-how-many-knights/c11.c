#include <stdio.h>

int main(void) {
    int rows, columns;
    while (scanf("%d %d", &rows, &columns) == 2 && (rows != 0 || columns != 0)) {
        int shorter = rows < columns ? rows : columns;
        int longer = rows > columns ? rows : columns;
        int answer;
        if (shorter == 0) answer = 0;
        else if (shorter == 1) answer = longer;
        else if (shorter == 2) {
            int remainder = longer % 4;
            answer = 4 * (longer / 4) + (2 * remainder < 4 ? 2 * remainder : 4);
        } else answer = (rows * columns + 1) / 2;
        printf("%d knights may be placed on a %d row %d column board.\n", answer, rows, columns);
    }
    return 0;
}
