#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n, k; cin >> n >> k; vector<string> names(n); vector<int> period(n);
        priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> events;
        for (int i = 0; i < n; ++i) { cin >> names[i] >> period[i]; events.push({period[i], i}); }
        while (k--) {
            auto [time, id] = events.top(); events.pop();
            cout << time << ' ' << names[id] << '\n';
            events.push({time + period[id], id});
        }
    }
}
