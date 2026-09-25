#include <stdio.h>
#include <string.h>

int main(void) {
    const char *symbols = "WHQESTX";
    const int duration[7] = {64,32,16,8,4,2,1};
    char song[100001];
    while (scanf("%100000s", song) == 1 && strcmp(song, "*") != 0) {
        int sum = 0, answer = 0;
        for (int i = 0; song[i] != '\0'; ++i) {
            if (song[i] == '/') {
                if (sum == 64) ++answer;
                sum = 0;
            } else {
                const char *found = strchr(symbols, song[i]);
                sum += duration[found - symbols];
            }
        }
        printf("%d\n", answer);
    }
    return 0;
}
