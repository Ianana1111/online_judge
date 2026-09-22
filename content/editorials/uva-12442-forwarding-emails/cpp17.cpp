#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n; cin >> n; vector<int> next(n),indegree(n,0),reach(n,0),removed;
        for (int i = 0; i < n; ++i) { int u,v; cin >> u >> v; --u; --v; next[u] = v; ++indegree[v]; }
        queue<int> pending; for (int i = 0; i < n; ++i) if (indegree[i] == 0) pending.push(i);
        while (!pending.empty()) { int u = pending.front(); pending.pop(); removed.push_back(u); if (--indegree[next[u]] == 0) pending.push(next[u]); }
        for (int start = 0; start < n; ++start) if (indegree[start] > 0 && reach[start] == 0) {
            vector<int> cycle; int at = start;
            do { cycle.push_back(at); at = next[at]; } while (at != start);
            for (int v : cycle) reach[v] = cycle.size();
        }
        for (auto it = removed.rbegin(); it != removed.rend(); ++it) reach[*it] = reach[next[*it]] + 1;
        int best = 0; for (int i = 1; i < n; ++i) if (reach[i] > reach[best]) best = i;
        cout << "Case " << tc << ": " << best+1 << '\n';
    }
}
