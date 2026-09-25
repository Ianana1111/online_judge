#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        long long n; cin >> n; string digits;
        do {
            int bit = (n % 2 + 2) % 2;
            digits += char('0' + bit);
            n = (n - bit) / -2;
        } while (n != 0);
        reverse(digits.begin(), digits.end());
        cout << "Case #" << tc << ": " << digits << '\n';
    }
}
