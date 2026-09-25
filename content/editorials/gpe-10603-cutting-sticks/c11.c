#include <stdio.h>
#include <limits.h>
int main(void) {
    int length;
    while (scanf("%d", &length) == 1 && length) {
        int n, cut[52], dp[52][52] = {{0}};
        scanf("%d", &n); cut[0] = 0; cut[n + 1] = length;
        for (int i = 1; i <= n; i++) scanf("%d", &cut[i]);
        for (int gap = 2; gap <= n + 1; gap++) {
            for (int left = 0; left + gap <= n + 1; left++) {
                int right = left + gap;
                dp[left][right] = INT_MAX;
                for (int first = left + 1; first < right; first++) {
                    int cost = cut[right] - cut[left] + dp[left][first] + dp[first][right];
                    if (cost < dp[left][right]) dp[left][right] = cost;
                }
            }
        }
        printf("The minimum cutting is %d.\n", dp[0][n + 1]);
    }
    return 0;
}
