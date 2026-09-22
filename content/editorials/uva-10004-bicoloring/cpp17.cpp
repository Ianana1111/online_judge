#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n != 0) {
        int m; cin >> m; vector<vector<int>> graph(n);
        while (m--) { int a, b; cin >> a >> b; graph[a].push_back(b); graph[b].push_back(a); }
        vector<int> color(n, -1); bool good = true;
        for (int root = 0; root < n; ++root) if (color[root] == -1) {
            queue<int> pending; color[root] = 0; pending.push(root);
            while (!pending.empty()) {
                int u = pending.front(); pending.pop();
                for (int v : graph[u]) {
                    if (color[v] == -1) { color[v] = 1 - color[u]; pending.push(v); }
                    else if (color[v] == color[u]) good = false;
                }
            }
        }
        cout << (good ? "BICOLORABLE." : "NOT BICOLORABLE.") << '\n';
    }
}
