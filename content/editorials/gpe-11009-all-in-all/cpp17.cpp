#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s, t;
    while (cin >> s >> t) {
        size_t matched = 0;
        for (char ch : t) if (matched < s.size() && ch == s[matched]) ++matched;
        cout << (matched == s.size() ? "Yes" : "No") << '\n';
    }
}
