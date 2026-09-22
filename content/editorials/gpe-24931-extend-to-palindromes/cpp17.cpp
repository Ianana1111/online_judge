#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s;
    while (cin >> s) {
        string reversed = s; reverse(reversed.begin(), reversed.end());
        string joined = reversed + "#" + s; vector<int> prefix(joined.size(), 0);
        for (int i = 1; i < int(joined.size()); ++i) {
            int length = prefix[i - 1];
            while (length > 0 && joined[i] != joined[length]) length = prefix[length - 1];
            if (joined[i] == joined[length]) ++length;
            prefix[i] = length;
        }
        int suffix = prefix.back(); string extra = s.substr(0, s.size() - suffix); reverse(extra.begin(), extra.end());
        cout << s << extra << '\n';
    }
}
