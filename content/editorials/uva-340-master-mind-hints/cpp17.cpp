#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, game = 0;
    while (cin >> n && n != 0) {
        vector<int> secret(n); array<int, 10> a{};
        for (int &x : secret) { cin >> x; ++a[x]; }
        cout << "Game " << ++game << ":\n";
        while (true) {
            vector<int> guess(n); for (int &x : guess) cin >> x;
            if (guess[0] == 0) break;
            array<int, 10> b{}; int strong = 0, total = 0;
            for (int i = 0; i < n; ++i) { ++b[guess[i]]; if (guess[i] == secret[i]) ++strong; }
            for (int digit = 1; digit <= 9; ++digit) total += min(a[digit], b[digit]);
            cout << "    (" << strong << ',' << total - strong << ")\n";
        }
    }
}
