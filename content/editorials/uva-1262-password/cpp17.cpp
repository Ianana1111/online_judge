#include <array>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int k; cin >> k; array<string,6> first,second; for (auto &row : first) cin >> row; for (auto &row : second) cin >> row;
        array<string,5> choices;
        for (int col = 0; col < 5; ++col) {
            array<bool,26> a{},b{};
            for (int row = 0; row < 6; ++row) { a[first[row][col]-'A'] = true; b[second[row][col]-'A'] = true; }
            for (int letter = 0; letter < 26; ++letter) if (a[letter] && b[letter]) choices[col] += char('A'+letter);
        }
        array<int,6> suffix{}; suffix[5] = 1;
        for (int col = 4; col >= 0; --col) suffix[col] = suffix[col+1] * choices[col].size();
        int total = suffix[0];
        if (k > total) { cout << "NO\n"; continue; }
        int rank = k - 1; string answer;
        for (int col = 0; col < 5; ++col) { int block = suffix[col+1]; answer += choices[col][rank / block]; rank %= block; }
        cout << answer << '\n';
    }
}
