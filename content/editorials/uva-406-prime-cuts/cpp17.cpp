#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<bool> prime(1001, true);
    prime[0] = prime[1] = false;
    for (int p = 2; p * p <= 1000; ++p)
        if (prime[p]) for (int v = p * p; v <= 1000; v += p) prime[v] = false;
    int n, c;
    while (cin >> n >> c) {
        vector<int> values{1};
        for (int v = 2; v <= n; ++v) if (prime[v]) values.push_back(v);
        int length = values.size();
        int take = min(length, 2 * c - length % 2);
        int start = (length - take) / 2;
        cout << n << ' ' << c << ':';
        for (int i = start; i < start + take; ++i) cout << ' ' << values[i];
        cout << "\n\n";
    }
}
