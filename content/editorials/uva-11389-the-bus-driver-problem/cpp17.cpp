#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, limit, rate;
    while (cin >> n >> limit >> rate && n != 0) {
        vector<int> morning(n), evening(n);
        for (int& x : morning) cin >> x;
        for (int& x : evening) cin >> x;
        sort(morning.begin(), morning.end());
        sort(evening.rbegin(), evening.rend());
        long long cost = 0;
        for (int i = 0; i < n; ++i) cost += 1LL * max(0, morning[i] + evening[i] - limit) * rate;
        cout << cost << '\n';
    }
}
