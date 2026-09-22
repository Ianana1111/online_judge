#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long difference;
    while (cin >> difference && difference != 0) {
        long long q = difference / 9, r = difference % 9;
        if (r == 0) cout << 10 * q - 1 << ' ' << 10 * q;
        else cout << 10 * q + r;
        cout << '\n';
    }
}
