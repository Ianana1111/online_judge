#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string digits; cin >> digits; int n = digits.size(); vector<long long> best(n+1,0);
        for (int i = n - 1; i >= 0; --i) {
            if (digits[i] == '0') { best[i] = best[i+1]; continue; }
            long long value = 0;
            for (int j = i; j < n && j < i + 10; ++j) {
                value = value * 10 + digits[j] - '0';
                if (value > 2147483647LL) break;
                best[i] = max(best[i],value + best[j + 1]);
            }
        }
        cout << best[0] << '\n';
    }
}
