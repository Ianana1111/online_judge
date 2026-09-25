#include <stdio.h>
#include <string.h>

int main(void) {
    char short_text[100001], long_text[100001];
    while (scanf("%100000s %100000s", short_text, long_text) == 2) {
        size_t matched = 0, length = strlen(short_text);
        for (size_t i = 0; long_text[i] != '\0'; ++i)
            if (matched < length && long_text[i] == short_text[matched]) ++matched;
        puts(matched == length ? "Yes" : "No");
    }
    return 0;
}
