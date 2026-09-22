#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string line; bool first = true;
    while (getline(cin, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        array<int, 128> count{};
        for (unsigned char ch : line) ++count[ch];
        vector<int> codes;
        for (int ch = 32; ch < 128; ++ch) if (count[ch] > 0) codes.push_back(ch);
        sort(codes.begin(), codes.end(), [&](int a, int b) {
            if (count[a] != count[b]) return count[a] < count[b];
            return a > b;
        });
        if (!first) cout << '\n';
        first = false;
        for (int ch : codes) cout << ch << ' ' << count[ch] << '\n';
    }
}
