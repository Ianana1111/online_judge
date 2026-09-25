#include <stdio.h>
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n != 0) {
        int edges, a, b, graph[200][200] = {{0}}, degree[200] = {0};
        scanf("%d", &edges);
        for (int i = 0; i < edges; ++i) {
            scanf("%d %d", &a, &b);
            graph[a][degree[a]++] = b;
            graph[b][degree[b]++] = a;
        }
        int color[200] = {0}, queue[200], head = 0, tail = 0, good = 1;
        color[0] = 1; queue[tail++] = 0;
        while (head < tail) {
            int u = queue[head++];
            for (int i = 0; i < degree[u]; ++i) {
                int v = graph[u][i];
                if (!color[v]) { color[v] = 3 - color[u]; queue[tail++] = v; }
                else if (color[v] == color[u]) good = 0;
            }
        }
        puts(good ? "BICOLORABLE." : "NOT BICOLORABLE.");
    }
    return 0;
}
