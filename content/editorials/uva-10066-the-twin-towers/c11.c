#include <stdio.h>
static long long a[101], b[101];
static int dp[101][101];
int main(void) {
    int n, m, case_no = 0;
    while (scanf("%d %d", &n, &m) == 2 && (n || m)) {
        for (int i = 1; i <= n; i++) scanf("%lld", &a[i]);
        for (int j = 1; j <= m; j++) scanf("%lld", &b[j]);
        for (int i = 1; i <= n; i++) for (int j = 1; j <= m; j++) {
            if (a[i] == b[j]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }
        printf("Twin Towers #%d\nNumber of Tiles : %d\n\n", ++case_no, dp[n][m]);
    }
    return 0;
}
