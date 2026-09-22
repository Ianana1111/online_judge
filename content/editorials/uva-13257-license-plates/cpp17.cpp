#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string word; cin >> word; int n = word.size(); vector<array<int,26>> next(n+1); next[n].fill(n);
        for (int i = n - 1; i >= 0; --i) { next[i] = next[i+1]; next[i][word[i]-'A'] = i; }
        int answer = 0;
        for (int a = 0; a < 26; ++a) {
            int first = next[0][a]; if (first == n) continue;
            for (int b = 0; b < 26; ++b) {
                int second = next[first+1][b]; if (second == n) continue;
                for (int c = 0; c < 26; ++c) if (next[second+1][c] < n) ++answer;
            }
        }
        cout << answer << '\n';
    }
}
