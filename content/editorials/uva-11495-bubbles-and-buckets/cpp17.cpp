#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<int> bit(n + 1); long long moves = 0;
        for (int i = 0; i < n; ++i) {
            int x; cin >> x; int smaller = 0;
            for (int j = x; j > 0; j -= j & -j) smaller += bit[j];
            moves += i - smaller;
            for (int j = x; j <= n; j += j & -j) ++bit[j];
        }
        cout << (moves % 2 ? "Marcelo" : "Carlos") << ' ' << moves << '\n';
    }
}
