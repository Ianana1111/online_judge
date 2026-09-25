#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        long long n, m; cin >> n >> m;
        long long excess = n - m, overlap = (m - 1) / 2;
        if (tc) cout << '\n';
        cout << ((excess & overlap) == 0 ? 1 : 0) << '\n';
    }
}
