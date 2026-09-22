#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n && n != 0) {
        vector<long long> a(n), sums;
        for (auto& value : a) cin >> value;
        for (int i = 0; i < n; ++i)
            for (int j = i + 1; j < n; ++j) sums.push_back(a[i] + a[j]);
        sort(sums.begin(), sums.end());
        cout << "Case " << ++tc << ":\n";
        int queries; cin >> queries;
        while (queries--) {
            long long target; cin >> target;
            auto it = lower_bound(sums.begin(), sums.end(), target);
            long long answer = it == sums.end() ? sums.back() : *it;
            if (it != sums.begin() && llabs(*prev(it) - target) < llabs(answer - target))
                answer = *prev(it);
            cout << "Closest sum to " << target << " is " << answer << ".\n";
        }
    }
}
