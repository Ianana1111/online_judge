#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        int n,k; cin >> n >> k; vector<vector<int>> side(k,vector<int>(n+1,0)); vector<int> result(k);
        for (int j = 0; j < k; ++j) {
            int count,coin; cin >> count;
            for (int i = 0; i < count; ++i) { cin >> coin; side[j][coin] = 1; }
            for (int i = 0; i < count; ++i) { cin >> coin; side[j][coin] = -1; }
            char symbol; cin >> symbol; result[j] = symbol == '<' ? -1 : symbol == '>' ? 1 : 0;
        }
        int candidates = 0,answer = 0;
        for (int coin = 1; coin <= n; ++coin) {
            int possibilities = 0;
            for (int direction : {-1,1}) {
                bool consistent = true;
                for (int j = 0; j < k; ++j) if (side[j][coin] * direction != result[j]) { consistent = false; break; }
                if (consistent) ++possibilities;
            }
            if (possibilities > 0) { ++candidates; answer = coin; }
        }
        if (tc) cout << '\n';
        cout << (candidates == 1 ? answer : 0) << '\n';
    }
}
