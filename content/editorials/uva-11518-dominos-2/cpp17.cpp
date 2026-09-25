#include <iostream>
#include <queue>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n, m, pushes; cin >> n >> m >> pushes;
        vector<vector<int>> edges(n);
        for (int i = 0; i < m; ++i) { int a, b; cin >> a >> b; --a; --b; edges[a].push_back(b); }
        vector<bool> seen(n); queue<int> q; int fallen = 0;
        for (int i = 0; i < pushes; ++i) {
            int start; cin >> start; --start;
            if (!seen[start]) { seen[start] = true; q.push(start); ++fallen; }
        }
        while (!q.empty()) {
            int v = q.front(); q.pop();
            for (int w : edges[v]) if (!seen[w]) {
                seen[w] = true; q.push(w); ++fallen;
            }
        }
        cout << fallen << '\n';
    }
}
