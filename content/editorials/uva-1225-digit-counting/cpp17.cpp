#include <algorithm>
#include <array>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; array<int, 10> count{};
        for (int value = 1; value <= n; ++value)
            for (int x = value; x > 0; x /= 10) ++count[x % 10];
        for (int digit = 0; digit < 10; ++digit) cout << (digit ? " " : "") << count[digit];
        cout << '\n';
    }
}
