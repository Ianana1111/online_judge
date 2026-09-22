#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int lines; cin >> lines;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    array<long long, 26> count{};
    string text;
    for (int i = 0; i < lines; ++i) {
        getline(cin, text);
        for (char c : text) {
            if (c >= 'a' && c <= 'z') c = char(c - 'a' + 'A');
            if (c >= 'A' && c <= 'Z') ++count[c - 'A'];
        }
    }
    vector<int> order(26); iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) {
        if (count[a] != count[b]) return count[a] > count[b];
        return a < b;
    });
    for (int index : order)
        if (count[index] > 0) cout << char('A' + index) << ' ' << count[index] << '\n';
}
