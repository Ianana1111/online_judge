#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string a, b;
    while (cin >> a >> b) {
        array<int, 26> ca{}, cb{};
        for (char ch : a) ++ca[ch - 'A'];
        for (char ch : b) ++cb[ch - 'A'];
        sort(ca.begin(), ca.end()); sort(cb.begin(), cb.end());
        cout << (ca == cb ? "YES" : "NO") << '\n';
    }
}
