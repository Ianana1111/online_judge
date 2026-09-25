#include <stdio.h>
static long long vessels[1000];
static int feasible(int n, int containers, long long capacity) {
    int used = 1; long long current = 0;
    for (int i = 0; i < n; i++) {
        if (current + vessels[i] > capacity) { used++; current = 0; }
        current += vessels[i];
    }
    return used <= containers;
}
int main(void) {
    int n, containers;
    while (scanf("%d %d", &n, &containers) == 2) {
        long long low = 0, high = 0;
        for (int i = 0; i < n; i++) {
            scanf("%lld", &vessels[i]);
            if (vessels[i] > low) low = vessels[i];
            high += vessels[i];
        }
        while (low < high) {
            long long middle = low + (high - low) / 2;
            if (feasible(n, containers, middle)) high = middle;
            else low = middle + 1;
        }
        printf("%lld\n", low);
    }
    return 0;
}
