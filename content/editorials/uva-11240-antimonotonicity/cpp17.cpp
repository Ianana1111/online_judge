#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<int> a(n); for (int &x : a) cin >> x;
        int answer = 1, last = a[0]; bool needDown = true;
        for (int i = 1; i < n; ++i) {
            if ((needDown && last > a[i]) || (!needDown && last < a[i])) {
                ++answer; needDown = !needDown;
            }
            last = a[i];
        }
        cout << answer << '\n';
    }
}
