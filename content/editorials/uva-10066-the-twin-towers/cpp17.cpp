#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m, tc = 0;
    while (cin >> n >> m && (n || m)) {
        vector<long long> a(n), b(m); for (auto &x : a) cin >> x; for (auto &x : b) cin >> x;
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
        for (int i = 1; i <= n; ++i) for (int j = 1; j <= m; ++j) {
            if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
        cout << "Twin Towers #" << ++tc << "\nNumber of Tiles : " << dp[n][m] << "\n\n";
    }
}
