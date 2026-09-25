#include <stdio.h>

int main(void) {
    int ch;
    int inside = 0;
    int words = 0;
    int saw_character = 0;
    while ((ch = getchar()) != EOF) {
        if (ch == '\n') {
            printf("%d\n", words);
            inside = 0;
            words = 0;
            saw_character = 0;
            continue;
        }
        saw_character = 1;
        int letter = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
        if (letter && !inside) ++words;
        inside = letter;
    }
    if (saw_character) printf("%d\n", words);
    return 0;
}
