#include <stdio.h>

int main(void) {
    int ch;
    while ((ch = getchar()) != EOF) {
        if (ch == '\n' || ch == '\r') {
            putchar(ch);
        } else {
            int decoded = ch - 7;
            if (decoded < 32) decoded += 95;
            putchar(decoded);
        }
    }
    return 0;
}
