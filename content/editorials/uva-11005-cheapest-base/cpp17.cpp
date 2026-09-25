#include <array>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int cases;
    cin >> cases;
    for (int tc = 1; tc <= cases; ++tc) {
        array<int, 36> cost;
        for (int& c : cost) cin >> c;
        int queries;
        cin >> queries;
        if (tc > 1) cout << '\n';
        cout << "Case " << tc << ":\n";
        while (queries--) {
            long long number;
            cin >> number;
            int best = INT_MAX;
            vector<int> bases;
            for (int base = 2; base <= 36; ++base) {
                long long x = number;
                int total = 0;
                do {
                    total += cost[x % base];
                    x /= base;
                } while (x > 0);
                if (total < best) {
                    best = total;
                    bases.clear();
                }
                if (total == best) bases.push_back(base);
            }
            cout << "Cheapest base(s) for number " << number << ':';
            for (int base : bases) cout << ' ' << base;
            cout << '\n';
        }
    }
}
