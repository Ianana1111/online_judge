#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<int> weight(n),load(n);
        for (int i = 0; i < n; ++i) cin >> weight[i] >> load[i];
        const int inf = 3000001; vector<int> best(n+1,inf); best[0] = 0; int height = 0;
        for (int i = n - 1; i >= 0; --i) {
            for (int h = height; h >= 0; --h) if (best[h] <= load[i]) {
                best[h+1] = min(best[h+1],best[h] + weight[i]); height = max(height,h+1);
            }
        }
        cout << height << '\n';
    }
}
