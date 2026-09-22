#include <bits/stdc++.h>
using namespace std;
long long position(long long x, long long y) {
    long long diagonal = x + y;
    return diagonal * (diagonal + 1) / 2 + x;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        long long x, y, a, b; cin >> x >> y >> a >> b;
        cout << "Case " << tc << ": " << position(a, b) - position(x, y) << '\n';
    }
}
