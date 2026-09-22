#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m;
    while (cin >> n >> m && (n || m)) {
        set<int> a, b;
        for (int i = 0, x; i < n; ++i) { cin >> x; a.insert(x); }
        for (int i = 0, x; i < m; ++i) { cin >> x; b.insert(x); }
        int onlyA = 0, onlyB = 0;
        for (int x : a) if (!b.count(x)) ++onlyA;
        for (int x : b) if (!a.count(x)) ++onlyB;
        cout << min(onlyA, onlyB) << '\n';
    }
}
