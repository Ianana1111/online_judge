#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> digits{1}; array<int,1001> sums{}; sums[0] = 1;
    for (int n = 1; n <= 1000; ++n) {
        int carry = 0;
        for (int &digit : digits) { int product = digit * n + carry; digit = product % 10; carry = product / 10; }
        while (carry) { digits.push_back(carry % 10); carry /= 10; }
        for (int digit : digits) sums[n] += digit;
    }
    int n; while (cin >> n) cout << sums[n] << '\n';
}
