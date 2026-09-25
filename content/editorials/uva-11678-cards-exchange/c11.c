#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, m;
    while (scanf("%d %d", &n, &m) == 2 && (n != 0 || m != 0)) {
        unsigned char *alice = calloc(100001, 1);
        unsigned char *betty = calloc(100001, 1);
        if (alice == NULL || betty == NULL) return 1;
        for (int i = 0; i < n; ++i) { int card; scanf("%d", &card); alice[card] = 1; }
        for (int i = 0; i < m; ++i) { int card; scanf("%d", &card); betty[card] = 1; }
        int only_alice = 0, only_betty = 0;
        for (int card = 1; card <= 100000; ++card) {
            if (alice[card] && !betty[card]) ++only_alice;
            if (betty[card] && !alice[card]) ++only_betty;
        }
        printf("%d\n", only_alice < only_betty ? only_alice : only_betty);
        free(alice);
        free(betty);
    }
    return 0;
}
