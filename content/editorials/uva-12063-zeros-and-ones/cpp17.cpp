#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n, k; cin >> n >> k; unsigned long long answer = 0;
        if (n % 2 == 0 && k != 0) {
            int half = n / 2;
            vector<vector<unsigned long long>> dp(half + 1,vector<unsigned long long>(k));
            dp[1][1 % k] = 1;
            for (int length = 1; length < n; ++length) {
                vector<vector<unsigned long long>> next(half + 1,vector<unsigned long long>(k));
                for (int ones = 0; ones <= half; ++ones) for (int residue = 0; residue < k; ++residue) {
                    auto ways = dp[ones][residue];
                    next[ones][2 * residue % k] += ways;
                    if (ones < half) next[ones + 1][(2 * residue + 1) % k] += ways;
                }
                dp.swap(next);
            }
            answer = dp[half][0];
        }
        cout << "Case " << tc << ": " << answer << '\n';
    }
}
