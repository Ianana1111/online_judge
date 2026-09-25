#include <stdio.h>

int main(void) {
    const char key[] = "22233344455566677778889999";
    char text[31];
    while (scanf("%30s", text) == 1) {
        int letters = 0, hyphens = 0;
        for (int i = 0; text[i] != '\0'; ++i) {
            if (text[i] >= 'A' && text[i] <= 'Z') {
                ++letters;
                text[i] = key[text[i] - 'A'];
            } else if (text[i] == '-') ++hyphens;
        }
        printf("%s %d %d\n", text, letters, hyphens);
    }
    return 0;
}
