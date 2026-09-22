#include <bits/stdc++.h>
using namespace std;
bool square(vector<int> sticks) {
    int total = accumulate(sticks.begin(), sticks.end(), 0);
    if (total % 4 != 0) return false;
    int side = total / 4;
    if (*max_element(sticks.begin(), sticks.end()) > side) return false;
    int n = sticks.size(); vector<int> remainder(1 << n, -1); remainder[0] = 0;
    for (int mask = 0; mask < (1 << n); ++mask) if (remainder[mask] >= 0) {
        for (int i = 0; i < n; ++i) if (!(mask & (1 << i)) && remainder[mask] + sticks[i] <= side) {
            int next = mask | (1 << i);
            remainder[next] = (remainder[mask] + sticks[i]) % side;
        }
    }
    return remainder.back() == 0;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<int> sticks(n); for (int &x : sticks) cin >> x;
        cout << (square(sticks) ? "yes" : "no") << '\n';
    }
}
