#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int tests; if (scanf("%d", &tests) != 1) return 0;
    while (tests--) {
        int n, m, pushes; scanf("%d %d %d", &n, &m, &pushes);
        int *head = malloc((n + 1) * sizeof(int));
        int *to = malloc(m * sizeof(int));
        int *next = malloc(m * sizeof(int));
        int *queue = malloc((n + 1) * sizeof(int));
        char *seen = calloc(n + 1, 1);
        for (int i = 1; i <= n; i++) head[i] = -1;
        for (int i = 0; i < m; i++) {
            int a, b; scanf("%d %d", &a, &b);
            to[i] = b; next[i] = head[a]; head[a] = i;
        }
        int front = 0, back = 0;
        for (int i = 0; i < pushes; i++) {
            int x; scanf("%d", &x);
            if (!seen[x]) { seen[x] = 1; queue[back++] = x; }
        }
        while (front < back) {
            int x = queue[front++];
            for (int e = head[x]; e != -1; e = next[e]) {
                int y = to[e];
                if (!seen[y]) { seen[y] = 1; queue[back++] = y; }
            }
        }
        printf("%d\n", back);
        free(head); free(to); free(next); free(queue); free(seen);
    }
    return 0;
}
