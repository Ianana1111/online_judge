#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n; cin >> n; vector<vector<int>> a(n,vector<int>(n));
        for (auto &row : a) for (int &x : row) { char ch; cin >> ch; x = ch - '0'; }
        int m; cin >> m;
        while (m--) {
            string command; cin >> command;
            if (command == "row" || command == "col") {
                int x,y; cin >> x >> y; --x; --y;
                if (command == "row") swap(a[x],a[y]);
                else for (int r = 0; r < n; ++r) swap(a[r][x],a[r][y]);
            } else if (command == "transpose") {
                for (int r = 0; r < n; ++r) for (int c = r + 1; c < n; ++c) swap(a[r][c],a[c][r]);
            } else {
                int delta = command == "inc" ? 1 : 9;
                for (auto &row : a) for (int &x : row) x = (x + delta) % 10;
            }
        }
        cout << "Case #" << tc << '\n';
        for (auto &row : a) { for (int x : row) cout << x; cout << '\n'; }
        cout << '\n';
    }
}
