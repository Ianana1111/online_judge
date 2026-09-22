#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        vector<pair<int,int>> events; int start,finish;
        while (cin >> start >> finish && (start || finish)) events.push_back({start,finish});
        sort(events.begin(),events.end(),[](const auto &a,const auto &b) { return a.second < b.second; });
        int end = 0,answer = 0;
        for (auto [start,finish] : events) if (start >= end) { ++answer; end = finish; }
        cout << answer << '\n';
    }
}
