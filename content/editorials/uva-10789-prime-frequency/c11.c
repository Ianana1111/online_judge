#include <stdio.h>

int main(void) {
    unsigned char prime[2001] = {0};
    for (int i = 2; i <= 2000; ++i) prime[i] = 1;
    for (int p = 2; p * p <= 2000; ++p)
        if (prime[p])
            for (int multiple = p * p; multiple <= 2000; multiple += p)
                prime[multiple] = 0;
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        char text[2001];
        int count[128] = {0}, found = 0;
        scanf("%2000s", text);
        for (int i = 0; text[i] != '\0'; ++i) ++count[(unsigned char)text[i]];
        printf("Case %d: ", case_number);
        for (int ch = 0; ch < 128; ++ch)
            if (prime[count[ch]]) { putchar(ch); found = 1; }
        if (!found) fputs("empty", stdout);
        putchar('\n');
    }
    return 0;
}
