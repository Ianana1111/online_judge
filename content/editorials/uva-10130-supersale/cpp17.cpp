#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; array<int, 31> best{};
        for (int i = 0; i < n; ++i) {
            int price, weight; cin >> price >> weight;
            for (int capacity = 30; capacity >= weight; --capacity)
                best[capacity] = max(best[capacity], best[capacity - weight] + price);
        }
        int people, total = 0; cin >> people;
        while (people--) { int capacity; cin >> capacity; total += best[capacity]; }
        cout << total << '\n';
    }
}
