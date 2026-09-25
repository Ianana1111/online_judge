#include <stdio.h>

int main(void) {
    int ch;
    int opening = 1;
    while ((ch = getchar()) != EOF) {
        if (ch == '"') {
            fputs(opening ? "``" : "''", stdout);
            opening = !opening;
        } else {
            putchar(ch);
        }
    }
    return 0;
}
