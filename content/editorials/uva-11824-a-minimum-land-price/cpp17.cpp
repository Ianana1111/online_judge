#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const long long budget = 5000000;
    int tests; cin >> tests;
    while (tests--) {
        vector<long long> prices; string token;
        while (cin >> token && token != "0") {
            long long price = 0;
            for (char ch : token) price = min(budget + 1, price * 10 + ch - '0');
            prices.push_back(price);
        }
        sort(prices.rbegin(), prices.rend());
        long long total = 0; bool expensive = false;
        for (int i = 0; i < int(prices.size()); ++i) {
            long long power = 1;
            for (int exponent = 0; exponent <= i; ++exponent) {
                if (power > budget / 2 / prices[i]) { expensive = true; break; }
                power *= prices[i];
            }
            if (expensive || total + 2 * power > budget) { expensive = true; break; }
            total += 2 * power;
        }
        if (expensive) cout << "Too expensive\n";
        else cout << total << '\n';
    }
}
