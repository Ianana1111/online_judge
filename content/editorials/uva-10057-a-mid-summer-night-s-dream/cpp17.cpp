#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<int> values(n); for (int &value : values) cin >> value;
        sort(values.begin(),values.end());
        int low = values[(n - 1) / 2], high = values[n / 2];
        auto first = lower_bound(values.begin(),values.end(),low);
        auto after = upper_bound(values.begin(),values.end(),high);
        cout << low << ' ' << after - first << ' ' << high - low + 1 << '\n';
    }
}
