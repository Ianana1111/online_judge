#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n, distance; cin >> n >> distance; vector<int> points{0, 0};
        for (int i = 0; i < n; ++i) {
            char type, dash; int position; cin >> type >> dash >> position;
            points.push_back(position); if (type == 'B') points.push_back(position);
        }
        points.push_back(distance); points.push_back(distance);
        int answer = 0;
        for (int i = 2; i < int(points.size()); ++i) answer = max(answer, points[i] - points[i - 2]);
        cout << "Case " << tc << ": " << answer << '\n';
    }
}
