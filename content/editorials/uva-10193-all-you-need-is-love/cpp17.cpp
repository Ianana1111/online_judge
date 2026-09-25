#include <iostream>
#include <numeric>
#include <string>
using namespace std;
int value(const string &bits) { int result = 0; for (char ch : bits) result = result * 2 + ch - '0'; return result; }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        string a, b; cin >> a >> b;
        bool possible = gcd(value(a), value(b)) > 1;
        cout << "Pair #" << tc << ": " << (possible ? "All you need is love!" : "Love is not all you need!") << '\n';
    }
}
