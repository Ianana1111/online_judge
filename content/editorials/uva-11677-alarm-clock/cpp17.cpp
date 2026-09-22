#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int h1, m1, h2, m2;
    while (cin >> h1 >> m1 >> h2 >> m2 && (h1 || m1 || h2 || m2)) {
        int start = h1 * 60 + m1, finish = h2 * 60 + m2;
        cout << (finish > start ? finish - start : finish - start + 1440) << '\n';
    }
}
