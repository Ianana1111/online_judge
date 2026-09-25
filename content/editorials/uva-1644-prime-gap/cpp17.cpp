#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 1299709;
    vector<bool> prime(limit + 1, true); prime[0] = prime[1] = false;
    for (int p = 2; p * p <= limit; ++p) if (prime[p])
        for (int multiple = p * p; multiple <= limit; multiple += p) prime[multiple] = false;
    vector<int> values;
    for (int n = 2; n <= limit; ++n) if (prime[n]) values.push_back(n);
    int n;
    while (cin >> n && n != 0) {
        auto upper = lower_bound(values.begin(), values.end(), n);
        if (*upper == n) cout << 0 << '\n';
        else cout << *upper - *prev(upper) << '\n';
    }
}
