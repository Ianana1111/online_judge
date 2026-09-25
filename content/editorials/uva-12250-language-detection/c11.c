#include <stdio.h>
#include <string.h>

int main(void) {
    const char *words[] = {"HELLO", "HOLA", "HALLO", "BONJOUR", "CIAO", "ZDRAVSTVUJTE"};
    const char *languages[] = {"ENGLISH", "SPANISH", "GERMAN", "FRENCH", "ITALIAN", "RUSSIAN"};
    char word[32];
    int case_number = 0;
    while (scanf("%31s", word) == 1 && strcmp(word, "#") != 0) {
        const char *answer = "UNKNOWN";
        for (int i = 0; i < 6; ++i)
            if (strcmp(word, words[i]) == 0) { answer = languages[i]; break; }
        printf("Case %d: %s\n", ++case_number, answer);
    }
    return 0;
}
