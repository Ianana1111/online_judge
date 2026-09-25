#include <stdio.h>
#include <stdlib.h>
static int *parent, *size;
static int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}
int main(void) {
    int n, m, case_no = 0;
    while (scanf("%d %d", &n, &m) == 2 && (n || m)) {
        parent = malloc((n + 1) * sizeof(int));
        size = malloc((n + 1) * sizeof(int));
        for (int i = 1; i <= n; i++) { parent[i] = i; size[i] = 1; }
        int groups = n;
        for (int i = 0; i < m; i++) {
            int a, b; scanf("%d %d", &a, &b);
            a = find(a); b = find(b);
            if (a != b) {
                if (size[a] < size[b]) { int tmp = a; a = b; b = tmp; }
                parent[b] = a; size[a] += size[b]; groups--;
            }
        }
        printf("Case %d: %d\n", ++case_no, groups);
        free(parent); free(size);
    }
    return 0;
}
