#include <bits/stdc++.h>
using namespace std;
struct Maker { string name; int low, high; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        int d; cin >> d; vector<Maker> makers(d);
        for (auto &m : makers) cin >> m.name >> m.low >> m.high;
        if (tc) cout << '\n';
        int q; cin >> q;
        while (q--) {
            int price, matches = 0; string answer; cin >> price;
            for (const auto &m : makers) if (m.low <= price && price <= m.high) { ++matches; answer = m.name; }
            cout << (matches == 1 ? answer : "UNDETERMINED") << '\n';
        }
    }
}
