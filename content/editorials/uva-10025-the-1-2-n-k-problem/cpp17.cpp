#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        long long target; cin >> target; target = llabs(target);
        long long n = 0, sum = 0;
        while (n == 0 || sum < target || (sum - target) % 2 != 0) { ++n; sum += n; }
        if (tc) cout << '\n';
        cout << n << '\n';
    }
}
