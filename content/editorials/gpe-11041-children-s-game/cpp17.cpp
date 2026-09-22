#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<string> values(n); for (auto &value : values) cin >> value;
        sort(values.begin(), values.end(), [](const string &a, const string &b) { return a + b > b + a; });
        for (const string &value : values) cout << value;
        cout << '\n';
    }
}
