#include <algorithm>
#include <climits>
#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int length;
    while (cin >> length && length) {
        int n; cin >> n; vector<int> cut(n + 2); cut[0] = 0; cut[n + 1] = length;
        for (int i = 1; i <= n; ++i) cin >> cut[i];
        vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
        for (int gap = 2; gap < n + 2; ++gap) for (int left = 0; left + gap < n + 2; ++left) {
            int right = left + gap; dp[left][right] = INT_MAX;
            for (int first = left + 1; first < right; ++first)
                dp[left][right] = min(dp[left][right], cut[right] - cut[left] + dp[left][first] + dp[first][right]);
        }
        cout << "The minimum cutting is " << dp[0][n + 1] << ".\n";
    }
}
