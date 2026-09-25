#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 100000; vector<int> smallest(limit + 1, 0);
    for (int value = 1; value <= limit; ++value) {
        int target = value;
        for (int x = value; x > 0; x /= 10) target += x % 10;
        if (target <= limit && smallest[target] == 0) smallest[target] = value;
    }
    int tests; cin >> tests;
    while (tests--) { int n; cin >> n; cout << smallest[n] << '\n'; }
}
