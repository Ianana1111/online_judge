#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int start, target, tc = 0;
    while (cin >> start >> target && (start || target)) {
        vector<int> distance(max(start, target) + 1, -1); queue<int> q;
        distance[start] = 0; q.push(start);
        while (!q.empty()) {
            int value = q.front(); q.pop(); int remaining = value;
            vector<int> factors;
            for (int p = 2; p * p <= remaining; ++p) if (remaining % p == 0) {
                factors.push_back(p);
                while (remaining % p == 0) remaining /= p;
            }
            if (remaining > 1 && remaining < value) factors.push_back(remaining);
            for (int factor : factors) {
                int next = value + factor;
                if (next > target || distance[next] >= 0) continue;
                distance[next] = distance[value] + 1; q.push(next);
            }
        }
        cout << "Case " << ++tc << ": " << distance[target] << '\n';
    }
}
