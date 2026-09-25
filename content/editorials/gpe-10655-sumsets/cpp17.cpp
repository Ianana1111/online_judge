#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
struct PairSum { long long sum; int a, b; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<long long> a(n); for (auto &x : a) cin >> x; sort(a.begin(), a.end());
        vector<PairSum> pairs;
        for (int i = 0; i < n; ++i) for (int j = i + 1; j < n; ++j) pairs.push_back({a[i] + a[j], i, j});
        sort(pairs.begin(), pairs.end(), [](const PairSum &x, const PairSum &y) { return x.sum < y.sum; });
        bool found = false; long long answer = 0;
        for (int d = n - 1; d >= 0 && !found; --d) for (int c = 0; c < n && !found; ++c) if (c != d) {
            long long target = a[d] - a[c];
            auto it = lower_bound(pairs.begin(), pairs.end(), target, [](const PairSum &p, long long value) { return p.sum < value; });
            for (; it != pairs.end() && it->sum == target; ++it)
                if (it->a != c && it->a != d && it->b != c && it->b != d) { answer = a[d]; found = true; break; }
        }
        if (found) cout << answer << '\n'; else cout << "no solution\n";
    }
}
