#include <stdio.h>
#include <string.h>
static char keyword[20][71], excuse[20][1001];
static int score[20];
static void finish(char *token, int *length, int count, int *points) {
    if (*length) {
        token[*length] = 0;
        for (int i = 0; i < count; i++) if (!strcmp(token, keyword[i])) { (*points)++; break; }
        *length = 0;
    }
}
int main(void) {
    int k, e, case_no = 0;
    while (scanf("%d %d", &k, &e) == 2) {
        for (int i = 0; i < k; i++) scanf("%70s", keyword[i]);
        char discard[1001]; fgets(discard, sizeof(discard), stdin);
        int best = 0;
        for (int i = 0; i < e; i++) {
            fgets(excuse[i], sizeof(excuse[i]), stdin);
            int length = strlen(excuse[i]);
            while (length && (excuse[i][length - 1] == '\n' || excuse[i][length - 1] == '\r'))
                excuse[i][--length] = 0;
            char token[1001]; int used = 0; score[i] = 0;
            for (int j = 0; j < length; j++) {
                unsigned char ch = excuse[i][j];
                if (ch >= 'A' && ch <= 'Z') token[used++] = ch - 'A' + 'a';
                else if (ch >= 'a' && ch <= 'z') token[used++] = ch;
                else finish(token, &used, k, &score[i]);
            }
            finish(token, &used, k, &score[i]);
            if (score[i] > best) best = score[i];
        }
        printf("Excuse Set #%d\n", ++case_no);
        for (int i = 0; i < e; i++) if (score[i] == best) puts(excuse[i]);
        putchar('\n');
    }
    return 0;
}
