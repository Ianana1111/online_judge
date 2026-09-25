#include <stdio.h>
#include <string.h>
static int previous[1002], current[1002];
static void trim_crlf(char *s) {
    int n = strlen(s);
    while (n && (s[n - 1] == '\n' || s[n - 1] == '\r')) s[--n] = 0;
}
int main(void) {
    char a[1005], b[1005];
    while (fgets(a, sizeof(a), stdin) && fgets(b, sizeof(b), stdin)) {
        trim_crlf(a); trim_crlf(b);
        int na = strlen(a), nb = strlen(b);
        memset(previous, 0, sizeof(previous));
        for (int i = 0; i < na; i++) {
            current[0] = 0;
            for (int j = 1; j <= nb; j++) {
                if (a[i] == b[j - 1]) current[j] = previous[j - 1] + 1;
                else current[j] = previous[j] > current[j - 1] ? previous[j] : current[j - 1];
            }
            memcpy(previous, current, (nb + 1) * sizeof(int));
        }
        printf("%d\n", previous[nb]);
    }
    return 0;
}
