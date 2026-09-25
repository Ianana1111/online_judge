#include <stdio.h>
#include <string.h>

static void print_result(const int count[128], int best) {
    for (int ch = 'A'; ch <= 'Z'; ++ch)
        if (best > 0 && count[ch] == best) putchar(ch);
    for (int ch = 'a'; ch <= 'z'; ++ch)
        if (best > 0 && count[ch] == best) putchar(ch);
    printf(" %d\n", best);
}

int main(void) {
    int count[128] = {0};
    int best = 0, saw_character = 0, ch;
    while ((ch = getchar()) != EOF) {
        if (ch == '\n') {
            print_result(count, best);
            memset(count, 0, sizeof(count));
            best = 0;
            saw_character = 0;
            continue;
        }
        saw_character = 1;
        if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
            ++count[ch];
            if (count[ch] > best) best = count[ch];
        }
    }
    if (saw_character) print_result(count, best);
    return 0;
}
