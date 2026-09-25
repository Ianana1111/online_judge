#include <stdio.h>

int main(void) {
    int count, case_number = 0;
    while (scanf("%d", &count) == 1 && count != 0) {
        int heights[50], total = 0;
        for (int i = 0; i < count; ++i) {
            scanf("%d", &heights[i]);
            total += heights[i];
        }
        int target = total / count, moves = 0;
        for (int i = 0; i < count; ++i)
            if (heights[i] > target) moves += heights[i] - target;
        printf("Set #%d\nThe minimum number of moves is %d.\n\n", ++case_number, moves);
    }
    return 0;
}
