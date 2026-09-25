#include <stdio.h>
static int weight[1000], load[1000], best[1001];
int main(void) {
    int n;
    while (scanf("%d", &n) == 1 && n) {
        for (int i = 0; i < n; i++) scanf("%d %d", &weight[i], &load[i]);
        const int inf = 3000001;
        best[0] = 0;
        for (int h = 1; h <= n; h++) best[h] = inf;
        int height = 0;
        for (int i = n - 1; i >= 0; i--) {
            for (int h = height; h >= 0; h--) if (best[h] <= load[i]) {
                int total = best[h] + weight[i];
                if (total < best[h + 1]) best[h + 1] = total;
                if (h + 1 > height) height = h + 1;
            }
        }
        printf("%d\n", height);
    }
    return 0;
}
