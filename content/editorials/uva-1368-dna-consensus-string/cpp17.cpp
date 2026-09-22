#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    const string alphabet = "ACGT";
    while (tests--) {
        int m, n; cin >> m >> n; vector<string> dna(m);
        for (string &row : dna) cin >> row;
        string result; int error = 0;
        for (int col = 0; col < n; ++col) {
            array<int, 4> count{};
            for (const string &row : dna) ++count[alphabet.find(row[col])];
            int best = 0;
            for (int k = 1; k < 4; ++k) if (count[k] > count[best]) best = k;
            result += alphabet[best]; error += m - count[best];
        }
        cout << result << '\n' << error << '\n';
    }
}
