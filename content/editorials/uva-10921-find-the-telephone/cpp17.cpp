#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const string key = "22233344455566677778889999";
    string text;
    while (cin >> text) {
        int letters = 0, hyphens = 0;
        for (char& ch : text) {
            if (ch >= 'A' && ch <= 'Z') { ++letters; ch = key[ch - 'A']; }
            else if (ch == '-') ++hyphens;
        }
        cout << text << ' ' << letters << ' ' << hyphens << '\n';
    }
}
