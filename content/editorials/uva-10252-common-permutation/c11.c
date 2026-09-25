#include <stdio.h>

int main(void) {
    char first[1003], second[1003];
    while (fgets(first, sizeof(first), stdin) != NULL
           && fgets(second, sizeof(second), stdin) != NULL) {
        int count_a[26] = {0}, count_b[26] = {0};
        for (int i = 0; first[i] != '\0'; ++i)
            if (first[i] >= 'a' && first[i] <= 'z') ++count_a[first[i] - 'a'];
        for (int i = 0; second[i] != '\0'; ++i)
            if (second[i] >= 'a' && second[i] <= 'z') ++count_b[second[i] - 'a'];
        for (int letter = 0; letter < 26; ++letter) {
            int common = count_a[letter] < count_b[letter] ? count_a[letter] : count_b[letter];
            while (common-- > 0) putchar('a' + letter);
        }
        putchar('\n');
    }
    return 0;
}
