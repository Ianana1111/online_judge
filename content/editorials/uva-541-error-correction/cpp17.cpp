#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<int> rows(n, 0), columns(n, 0);
        for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) {
            int bit; cin >> bit; rows[i] ^= bit; columns[j] ^= bit;
        }
        vector<int> oddRows, oddColumns;
        for (int i = 0; i < n; ++i) { if (rows[i]) oddRows.push_back(i); if (columns[i]) oddColumns.push_back(i); }
        if (oddRows.empty() && oddColumns.empty()) cout << "OK\n";
        else if (oddRows.size() == 1 && oddColumns.size() == 1) cout << "Change bit (" << oddRows[0] + 1 << ',' << oddColumns[0] + 1 << ")\n";
        else cout << "Corrupt\n";
    }
}
