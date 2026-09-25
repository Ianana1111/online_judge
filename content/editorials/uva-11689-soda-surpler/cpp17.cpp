#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int owned, found, cost; cin >> owned >> found >> cost;
        int empty = owned + found, total = 0;
        while (empty >= cost) {
            int drinks = empty / cost;
            total += drinks;
            empty = empty % cost + drinks;
        }
        cout << total << '\n';
    }
}
