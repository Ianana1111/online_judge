#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; int sum = 0;
        for (int d = 1; d < n; ++d) if (n % d == 0) sum += d;
        if (sum < n) cout << "deficient\n";
        else if (sum == n) cout << "perfect\n";
        else cout << "abundant\n";
    }
}
