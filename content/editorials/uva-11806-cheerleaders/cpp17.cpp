#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int MOD = 1000007;
    vector<vector<int>> choose(401,vector<int>(401));
    choose[0][0] = 1;
    for (int n = 1; n <= 400; ++n) {
        choose[n][0] = choose[n][n] = 1;
        for (int k = 1; k < n; ++k) choose[n][k] = (choose[n - 1][k - 1] + choose[n - 1][k]) % MOD;
    }
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int rows, cols, k; cin >> rows >> cols >> k; long long answer = 0;
        for (int mask = 0; mask < 16; ++mask) {
            int availableRows = rows - ((mask & 1) != 0) - ((mask & 2) != 0);
            int availableCols = cols - ((mask & 4) != 0) - ((mask & 8) != 0);
            int cells = availableRows * availableCols;
            int ways = k > cells ? 0 : choose[cells][k];
            if (__builtin_popcount((unsigned)mask) & 1) answer -= ways; else answer += ways;
        }
        answer = (answer % MOD + MOD) % MOD;
        cout << "Case " << tc << ": " << answer << '\n';
    }
}
