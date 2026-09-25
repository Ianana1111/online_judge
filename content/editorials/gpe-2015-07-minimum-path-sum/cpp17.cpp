#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int cases;
    cin >> cases;
    while (cases--) {
        int rows, cols;
        cin >> rows >> cols;
        vector<long long> dp(cols);
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) {
                long long value;
                cin >> value;
                if (r == 0 && c == 0) dp[c] = value;
                else if (r == 0) dp[c] = dp[c - 1] + value;
                else if (c == 0) dp[c] += value;
                else dp[c] = min(dp[c], dp[c - 1]) + value;
            }
        }
        cout << dp.back() << '\n';
    }
}
