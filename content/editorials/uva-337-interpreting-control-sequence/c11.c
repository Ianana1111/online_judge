#include <stdio.h>

int main(void) {
    int lines, test = 0;
    while (scanf("%d", &lines) == 1 && lines != 0) {
        int ch;
        while ((ch = getchar()) != '\n' && ch != EOF) {}
        char screen[10][10];
        for (int r = 0; r < 10; ++r)
            for (int c = 0; c < 10; ++c) screen[r][c] = ' ';
        int row = 0, col = 0, insert = 0;
        for (int line = 0; line < lines; ++line) {
            while ((ch = getchar()) != '\n' && ch != EOF) {
                if (ch == '^') {
                    int command = getchar();
                    if (command >= '0' && command <= '9') {
                        row = command - '0';
                        col = getchar() - '0';
                        continue;
                    }
                    if (command == 'b') col = 0;
                    else if (command == 'c') {
                        for (int r = 0; r < 10; ++r)
                            for (int c = 0; c < 10; ++c) screen[r][c] = ' ';
                    } else if (command == 'd' && row < 9) ++row;
                    else if (command == 'e') {
                        for (int c = col; c < 10; ++c) screen[row][c] = ' ';
                    } else if (command == 'h') row = col = 0;
                    else if (command == 'i') insert = 1;
                    else if (command == 'l' && col > 0) --col;
                    else if (command == 'o') insert = 0;
                    else if (command == 'r' && col < 9) ++col;
                    else if (command == 'u' && row > 0) --row;
                    if (command != '^') continue;
                    ch = '^';
                }
                if (insert)
                    for (int c = 9; c > col; --c) screen[row][c] = screen[row][c - 1];
                screen[row][col] = (char)ch;
                if (col < 9) ++col;
            }
        }
        printf("Case %d\n+----------+\n", ++test);
        for (int r = 0; r < 10; ++r) {
            putchar('|');
            for (int c = 0; c < 10; ++c) putchar(screen[r][c]);
            puts("|");
        }
        puts("+----------+");
    }
    return 0;
}
