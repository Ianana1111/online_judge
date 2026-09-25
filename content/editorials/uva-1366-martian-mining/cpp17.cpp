#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,m;
    while (cin >> n >> m && (n || m)) {
        vector<vector<long long>> west(n+1,vector<long long>(m+1)),north=west;
        for (int i=1;i<=n;++i) for (int j=1;j<=m;++j) { cin >> west[i][j];west[i][j]+=west[i][j-1]; }
        for (int i=1;i<=n;++i) for (int j=1;j<=m;++j) { cin >> north[i][j];north[i][j]+=north[i-1][j]; }
        vector<long long> dp(m+1);
        for (int i=1;i<=n;++i) for (int j=1;j<=m;++j) {
            dp[j]=max(dp[j]+west[i][j],dp[j-1]+north[i][j]);
        }
        cout << dp[m] << '\n';
    }
}
