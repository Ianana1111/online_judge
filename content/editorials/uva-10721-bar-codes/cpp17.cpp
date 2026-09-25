#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, k, m;
    while (cin >> n >> k >> m) {
        vector<vector<long long>> ways(k + 1, vector<long long>(n + 1, 0)); ways[0][0] = 1;
        for (int bars = 1; bars <= k; ++bars) for (int total = 1; total <= n; ++total)
            for (int width = 1; width <= m && width <= total; ++width)
                ways[bars][total] += ways[bars - 1][total - width];
        cout << ways[k][n] << '\n';
    }
}
