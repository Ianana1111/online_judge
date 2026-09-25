#include <stdio.h>
#include <string.h>
typedef struct { char dna[51]; int inversions; } Entry;
static Entry entries[100];
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    for (int tc = 0; tc < tests; tc++) {
        int length, count; scanf("%d %d", &length, &count);
        for (int k = 0; k < count; k++) {
            scanf("%50s", entries[k].dna);
            int score = 0;
            for (int i = 0; i < length; i++) for (int j = i + 1; j < length; j++)
                if (entries[k].dna[i] > entries[k].dna[j]) score++;
            entries[k].inversions = score;
        }
        for (int i = 1; i < count; i++) {
            Entry selected = entries[i]; int j = i;
            while (j > 0 && entries[j - 1].inversions > selected.inversions) {
                entries[j] = entries[j - 1]; j--;
            }
            entries[j] = selected;
        }
        if (tc) putchar('\n');
        for (int k = 0; k < count; k++) puts(entries[k].dna);
    }
    return 0;
}
