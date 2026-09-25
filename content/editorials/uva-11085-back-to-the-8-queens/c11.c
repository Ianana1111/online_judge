#include <stdio.h>
static int solutions[92][8], board[8], count;
static void generate(int col, unsigned rows, unsigned rising, unsigned falling) {
    if (col == 8) {
        for (int i = 0; i < 8; i++) solutions[count][i] = board[i];
        count++; return;
    }
    for (int row = 1; row <= 8; row++) {
        unsigned r = 1U << (row - 1);
        unsigned up = 1U << (row - 1 + col);
        unsigned down = 1U << (row - 1 - col + 7);
        if ((rows & r) || (rising & up) || (falling & down)) continue;
        board[col] = row;
        generate(col + 1, rows | r, rising | up, falling | down);
    }
}
int main(void) {
    generate(0, 0, 0, 0);
    int initial[8], case_no = 0;
    while (scanf("%d", &initial[0]) == 1) {
        for (int i = 1; i < 8; i++) scanf("%d", &initial[i]);
        int best = 8;
        for (int s = 0; s < count; s++) {
            int moves = 0;
            for (int i = 0; i < 8; i++) moves += initial[i] != solutions[s][i];
            if (moves < best) best = moves;
        }
        printf("Case %d: %d\n", ++case_no, best);
    }
    return 0;
}
