#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n) {
        vector<long long> a(n); for (auto &x : a) cin >> x;
        long long answer = 0;
        for (int left = 0; left < n; ++left) {
            long long product = 1;
            for (int right = left; right < n; ++right) {
                product *= a[right]; answer = max(answer, product);
            }
        }
        cout << "Case #" << ++tc << ": The maximum product is " << answer << ".\n\n";
    }
}
