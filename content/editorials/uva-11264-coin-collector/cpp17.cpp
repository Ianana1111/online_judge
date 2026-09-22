#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<long long> coins(n); for (auto &coin : coins) cin >> coin;
        long long sum = 0; int types = 0;
        for (int i = 0; i + 1 < n; ++i) {
            if (sum + coins[i] < coins[i+1]) { sum += coins[i]; ++types; }
        }
        cout << types + 1 << '\n';
    }
}
