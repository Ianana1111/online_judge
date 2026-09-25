#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static char words[1000][21], keys[1000][21];
static int compare_char(const void *a, const void *b) {
    return *(const unsigned char *)a - *(const unsigned char *)b;
}
static void signature(char *key, const char *word) {
    strcpy(key, word); qsort(key, strlen(key), 1, compare_char);
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 0; tc < tests; tc++) {
        int n; scanf("%d", &n);
        for (int i = 0; i < n; i++) {
            scanf("%20s", words[i]); signature(keys[i], words[i]);
        }
        if (tc) putchar('\n');
        char query[21], key[21];
        while (scanf("%20s", query) == 1 && strcmp(query, "END") != 0) {
            signature(key, query);
            printf("Anagrams for: %s\n", query);
            int found = 0;
            for (int i = 0; i < n; i++) if (strcmp(keys[i], key) == 0)
                printf("%3d) %s\n", ++found, words[i]);
            if (!found) printf("No anagrams for: %s\n", query);
        }
    }
    return 0;
}
