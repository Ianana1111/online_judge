#include <stdio.h>
#include <string.h>

int main(void) {
    int queries;
    if (scanf("%d", &queries) != 1) return 0;
    char dreams[10001][16];
    int depth = 0;
    while (queries--) {
        char command[16];
        scanf("%15s", command);
        if (strcmp(command, "Sleep") == 0) {
            scanf("%15s", dreams[depth]);
            ++depth;
        } else if (strcmp(command, "Kick") == 0) {
            if (depth > 0) --depth;
        } else if (strcmp(command, "Test") == 0) {
            puts(depth == 0 ? "Not in a dream" : dreams[depth - 1]);
        }
    }
    return 0;
}
