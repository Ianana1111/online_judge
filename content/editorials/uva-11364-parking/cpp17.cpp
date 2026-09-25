#include <algorithm>
#include <iomanip>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n;
        int left = 100, right = -1;
        for (int i = 0; i < n; ++i) { int x; cin >> x; left = min(left, x); right = max(right, x); }
        cout << 2 * (right - left) << '\n';
    }
}
