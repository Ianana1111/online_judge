#include <algorithm>
#include <iostream>
using namespace std;
int prefix(int bound) {
    int count = (bound + 1) / 2;
    return count * count;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int a, b; cin >> a >> b;
        cout << "Case " << tc << ": " << prefix(b) - prefix(a - 1) << '\n';
    }
}
