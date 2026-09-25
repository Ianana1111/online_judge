#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t size = 0, capacity = 32;
    char *word = malloc(capacity);
    if (word == NULL) return 1;
    int ch;
    while ((ch = getchar()) != EOF) {
        if (isspace((unsigned char)ch)) {
            while (size > 0) putchar(word[--size]);
            putchar(ch);
        } else {
            if (size == capacity) {
                capacity *= 2;
                char *grown = realloc(word, capacity);
                if (grown == NULL) { free(word); return 1; }
                word = grown;
            }
            word[size++] = (char)ch;
        }
    }
    while (size > 0) putchar(word[--size]);
    free(word);
    return 0;
}
