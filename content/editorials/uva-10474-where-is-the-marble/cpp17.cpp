#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q, tc = 0;
    while (cin >> n >> q && (n != 0 || q != 0)) {
        vector<int> marbles(n);
        for (int& x : marbles) cin >> x;
        sort(marbles.begin(), marbles.end());
        cout << "CASE# " << ++tc << ":\n";
        while (q--) {
            int x;
            cin >> x;
            auto it = lower_bound(marbles.begin(), marbles.end(), x);
            if (it != marbles.end() && *it == x)
                cout << x << " found at " << (it - marbles.begin() + 1) << '\n';
            else cout << x << " not found\n";
        }
    }
}
