#include <iomanip>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    cout << fixed << setprecision(4);
    while (tests--) {
        int n, chosen; string token;
        cin >> n >> token >> chosen;
        long double p = strtold(token.c_str(), nullptr);
        bool positive = false;
        for (char ch : token) {
            if (ch == 'e' || ch == 'E') break;
            if (ch >= '1' && ch <= '9') positive = true;
        }
        long double result = 0;
        if (positive) {
            long double q = 1 - p, weight = 1, total = 0, target = 0;
            for (int player = 1; player <= n; ++player) {
                total += weight;
                if (player == chosen) target = weight;
                weight *= q;
            }
            result = target / total;
        }
        cout << result << '\n';
    }
}
