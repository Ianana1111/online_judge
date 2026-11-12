#include <stdio.h>
#include <string.h>

#define INF (1LL << 60)

static char name[20][64];
static long long fee[20], road[20][20];
static int n;

static int find_station(const char *s) {
    for (int i = 0; i < n; ++i)
        if (strcmp(name[i], s) == 0) return i;
    return -1;
}

int main(void) {
    int maps;
    if (scanf("%d", &maps) != 1) return 0;
    for (int m = 1; m <= maps; ++m) {
        scanf("%d", &n);
        for (int i = 0; i < n; ++i) scanf("%63s %lld", name[i], &fee[i]);
        for (int i = 0; i < n; ++i)
            for (int j = 0; j < n; ++j) road[i][j] = INF;
        int paths;
        scanf("%d", &paths);
        for (int e = 0; e < paths; ++e) {
            char s[64], t[64];
            long long km;
            scanf("%63s %63s %lld", s, t, &km);
            int u = find_station(s), v = find_station(t);
            if (km < road[u][v]) road[u][v] = road[v][u] = km;
        }
        if (m > 1) putchar('\n');
        printf("Map #%d\n", m);
        int queries;
        scanf("%d", &queries);
        for (int q = 1; q <= queries; ++q) {
            char s[64], t[64];
            long long passengers;
            scanf("%63s %63s %lld", s, t, &passengers);
            int src = find_station(s), dst = find_station(t);
            long long cost[20];
            int prev[20], done[20];
            for (int i = 0; i < n; ++i) { cost[i] = INF; prev[i] = -1; done[i] = 0; }
            cost[src] = fee[src];
            for (int round = 0; round < n; ++round) {
                int x = -1;
                for (int i = 0; i < n; ++i)
                    if (!done[i] && cost[i] < INF && (x < 0 || cost[i] < cost[x])) x = i;
                if (x < 0) break;
                done[x] = 1;
                for (int y = 0; y < n; ++y)
                    if (road[x][y] < INF && cost[x] + 2 * road[x][y] + fee[y] < cost[y]) {
                        cost[y] = cost[x] + 2 * road[x][y] + fee[y];
                        prev[y] = x;
                    }
            }
            int path[20], len = 0;
            for (int x = dst; x != -1; x = prev[x]) path[len++] = x;
            printf("Query #%d\n", q);
            for (int i = len - 1; i >= 0; --i) printf("%s%c", name[path[i]], i == 0 ? '\n' : ' ');
            long long cents = (cost[dst] * 220 + passengers) / (2 * passengers);
            printf("Each passenger has to pay : %lld.%02lld taka\n", cents / 100, cents % 100);
        }
    }
    return 0;
}
