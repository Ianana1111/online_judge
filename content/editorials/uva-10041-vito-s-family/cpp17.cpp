#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int count; cin >> count;
        vector<int> positions(count);
        for (int& x : positions) cin >> x;
        sort(positions.begin(), positions.end());
        int home = positions[count / 2];
        long long total = 0;
        for (int x : positions) total += abs(x - home);
        cout << total << '\n';
    }
}
