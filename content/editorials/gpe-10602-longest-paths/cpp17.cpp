#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n && n) {
        int start; cin >> start;
        vector<vector<int>> edges(n + 1); vector<int> degree(n + 1), distance(n + 1, -1000000);
        int a, b;
        while (cin >> a >> b && (a || b)) { edges[a].push_back(b); ++degree[b]; }
        queue<int> ready;
        for (int i = 1; i <= n; ++i) if (degree[i] == 0) ready.push(i);
        distance[start] = 0;
        while (!ready.empty()) {
            int u = ready.front(); ready.pop();
            for (int v : edges[u]) {
                distance[v] = max(distance[v], distance[u] + 1);
                if (--degree[v] == 0) ready.push(v);
            }
        }
        int finish = start;
        for (int i = 1; i <= n; ++i)
            if (distance[i] > distance[finish] || (distance[i] == distance[finish] && i < finish)) finish = i;
        cout << "Case " << ++tc << ": The longest path from " << start << " has length " << distance[finish] << ", finishing at " << finish << ".\n\n";
    }
}
