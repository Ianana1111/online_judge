#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        map<array<int, 5>, int> count;
        for (int i = 0; i < n; ++i) {
            array<int, 5> courses; for (int &x : courses) cin >> x;
            sort(courses.begin(), courses.end()); ++count[courses];
        }
        int best = 0, answer = 0;
        for (const auto &entry : count) best = max(best, entry.second);
        for (const auto &entry : count) if (entry.second == best) answer += entry.second;
        cout << answer << '\n';
    }
}
