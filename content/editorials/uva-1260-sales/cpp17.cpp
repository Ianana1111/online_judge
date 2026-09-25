#include <algorithm>
#include <array>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; array<int, 5001> tree{}; long long answer = 0;
        auto query = [&](int x) { int count = 0; for (; x > 0; x -= x & -x) count += tree[x]; return count; };
        for (int i = 0; i < n; ++i) {
            int x; cin >> x; answer += query(x);
            for (int j = x; j <= 5000; j += j & -j) ++tree[j];
        }
        cout << answer << '\n';
    }
}
