#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 32768; vector<bool> prime(limit,true); prime[0] = prime[1] = false;
    for (int p = 2; p * p < limit; ++p) if (prime[p]) for (int multiple = p * p; multiple < limit; multiple += p) prime[multiple] = false;
    int n;
    while (cin >> n && n) {
        int count = 0;
        for (int p = 2; p <= n / 2; ++p) if (prime[p] && prime[n - p]) ++count;
        cout << count << '\n';
    }
}
