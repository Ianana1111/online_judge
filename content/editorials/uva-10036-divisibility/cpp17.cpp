#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n, k; cin >> n >> k; vector<int> a(n);
        for (int &x : a) cin >> x;
        vector<char> possible(k, false); possible[(a[0] % k + k) % k] = true;
        for (int i = 1; i < n; ++i) {
            int value = (a[i] % k + k) % k; vector<char> next(k, false);
            for (int r = 0; r < k; ++r) if (possible[r]) {
                next[(r + value) % k] = true;
                next[(r - value + k) % k] = true;
            }
            possible = move(next);
        }
        cout << (possible[0] ? "Divisible" : "Not divisible") << '\n';
    }
}
