#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; string line;
    while (cin >> n && n) {
        getline(cin,line); vector<vector<bool>> linked(n,vector<bool>(n,false));
        while (getline(cin,line)) {
            istringstream input(line); int u,v; input >> u; if (u == 0) break; --u;
            while (input >> v) { --v; linked[u][v] = linked[v][u] = true; }
        }
        vector<vector<int>> graph(n);
        for (int u = 0; u < n; ++u) for (int v = 0; v < n; ++v) if (linked[u][v]) graph[u].push_back(v);
        vector<int> entered(n,0),low(n,0); vector<bool> critical(n,false); int timer = 0;
        function<void(int,int)> dfs = [&](int u,int parent) {
            entered[u] = low[u] = ++timer; int children = 0;
            for (int v : graph[u]) {
                if (!entered[v]) {
                    ++children; dfs(v,u); low[u] = min(low[u],low[v]);
                    if (parent != -1 && low[v] >= entered[u]) critical[u] = true;
                } else if (v != parent) low[u] = min(low[u],entered[v]);
            }
            if (parent == -1 && children > 1) critical[u] = true;
        };
        dfs(0,-1); cout << count(critical.begin(),critical.end(),true) << '\n';
    }
}
