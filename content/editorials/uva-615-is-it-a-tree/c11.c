#include <stdio.h>
#include <string.h>
static char edge[101][101], exists[101], seen[101];
static int indegree[101], queue[101];
int main(void) {
    int u, v, case_no = 0;
    while (scanf("%d %d", &u, &v) == 2) {
        if (u < 0 && v < 0) break;
        if (u == 0 && v == 0) {
            int vertices = 0, roots = 0, root = 0, good = 1;
            for (int x = 1; x <= 100; x++) if (exists[x]) {
                vertices++;
                if (indegree[x] == 0) { roots++; root = x; }
                else if (indegree[x] != 1) good = 0;
            }
            if (vertices && roots != 1) good = 0;
            if (good && vertices) {
                int front = 0, back = 0;
                queue[back++] = root; seen[root] = 1;
                while (front < back) {
                    int x = queue[front++];
                    for (int y = 1; y <= 100; y++) if (edge[x][y] && !seen[y]) {
                        seen[y] = 1; queue[back++] = y;
                    }
                }
                if (back != vertices) good = 0;
            }
            printf("Case %d is %s", ++case_no, good ? "a tree." : "not a tree.");
            if (good && vertices) printf(" Root is %d.", root);
            putchar('\n');
            memset(edge, 0, sizeof(edge)); memset(exists, 0, sizeof(exists));
            memset(seen, 0, sizeof(seen)); memset(indegree, 0, sizeof(indegree));
        } else {
            edge[u][v] = 1; exists[u] = exists[v] = 1; indegree[v]++;
        }
    }
    return 0;
}
