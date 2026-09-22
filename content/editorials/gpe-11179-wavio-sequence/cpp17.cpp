#include <bits/stdc++.h>
using namespace std;
vector<int> ending(const vector<long long> &a) {
    vector<long long> tails; vector<int> length;
    for (long long value : a) {
        auto it = lower_bound(tails.begin(), tails.end(), value);
        int position = int(it - tails.begin());
        if (it == tails.end()) tails.push_back(value); else *it = value;
        length.push_back(position + 1);
    }
    return length;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<long long> values(n); for (auto &value : values) cin >> value;
        vector<int> left = ending(values); reverse(values.begin(),values.end());
        vector<int> right = ending(values); reverse(right.begin(),right.end());
        int answer = 1;
        for (int i = 0; i < n; ++i) answer = max(answer,2 * min(left[i],right[i]) - 1);
        cout << answer << '\n';
    }
}
