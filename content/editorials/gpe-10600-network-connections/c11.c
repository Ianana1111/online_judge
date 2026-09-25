#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static int *parent, *size;
static int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    char line[128]; fgets(line, sizeof(line), stdin);
    for (int tc = 0; tc < tests; tc++) {
        int n = 0;
        while (fgets(line, sizeof(line), stdin)) {
            if (sscanf(line, "%d", &n) == 1) break;
        }
        parent = malloc((n + 1) * sizeof(int));
        size = malloc((n + 1) * sizeof(int));
        for (int i = 1; i <= n; i++) { parent[i] = i; size[i] = 1; }
        int yes = 0, no = 0;
        while (fgets(line, sizeof(line), stdin)) {
            char op; int a, b;
            if (sscanf(line, " %c %d %d", &op, &a, &b) != 3) break;
            a = find(a); b = find(b);
            if (op == 'q') { if (a == b) yes++; else no++; }
            else if (a != b) {
                if (size[a] < size[b]) { int tmp = a; a = b; b = tmp; }
                parent[b] = a; size[a] += size[b];
            }
        }
        if (tc) putchar('\n');
        printf("%d,%d\n", yes, no);
        free(parent); free(size);
    }
    return 0;
}
