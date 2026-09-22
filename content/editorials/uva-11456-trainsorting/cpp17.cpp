#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<pair<string,int>> ordered;
        for (int i = 0; i < n; ++i) {
            string value; cin >> value; auto first = value.find_first_not_of('0');
            value = first == string::npos ? "0" : value.substr(first); ordered.push_back({value,i});
        }
        sort(ordered.begin(),ordered.end(),[](const auto &a,const auto &b) { if (a.first.size() != b.first.size()) return a.first.size() < b.first.size(); return a.first < b.first; });
        vector<int> weight(n),rise(n,1),fall(n,1);
        for (int rank = 0; rank < n; ++rank) weight[ordered[rank].second] = rank;
        int answer = 0;
        for (int i = n - 1; i >= 0; --i) {
            for (int j = i + 1; j < n; ++j) {
                if (weight[j] > weight[i]) rise[i] = max(rise[i],rise[j] + 1);
                if (weight[j] < weight[i]) fall[i] = max(fall[i],fall[j] + 1);
            }
            answer = max(answer,rise[i] + fall[i] - 1);
        }
        cout << answer << '\n';
    }
}
