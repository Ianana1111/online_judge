#include <bits/stdc++.h>
using namespace std;
struct Edge { int to,reverse; long long capacity; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,tc = 0;
    while (cin >> n && n) {
        int source,sink,m; cin >> source >> sink >> m; --source; --sink;
        vector<vector<Edge>> graph(n);
        for (int i = 0; i < m; ++i) {
            int u,v; long long capacity; cin >> u >> v >> capacity; --u; --v;
            int forward = graph[u].size(),backward = graph[v].size();
            graph[u].push_back({v,backward,capacity}); graph[v].push_back({u,forward,capacity});
        }
        vector<int> level(n),next(n);
        auto bfs = [&]() {
            fill(level.begin(),level.end(),-1); queue<int> queue; level[source] = 0; queue.push(source);
            while (!queue.empty()) { int u = queue.front(); queue.pop(); for (const auto &edge : graph[u]) if (edge.capacity > 0 && level[edge.to] < 0) { level[edge.to] = level[u] + 1; queue.push(edge.to); } }
            return level[sink] >= 0;
        };
        function<long long(int,long long)> dfs = [&](int u,long long available) -> long long {
            if (u == sink) return available;
            for (int &i = next[u]; i < (int)graph[u].size(); ++i) {
                Edge &edge = graph[u][i];
                if (edge.capacity <= 0 || level[edge.to] != level[u] + 1) continue;
                long long pushed = dfs(edge.to,min(available,edge.capacity));
                if (pushed) { edge.capacity -= pushed; graph[edge.to][edge.reverse].capacity += pushed; return pushed; }
            }
            return 0;
        };
        long long total = 0;
        while (bfs()) {
            fill(next.begin(),next.end(),0);
            while (long long pushed = dfs(source,LLONG_MAX / 4)) total += pushed;
        }
        cout << "Network " << ++tc << "\nThe bandwidth is " << total << ".\n\n";
    }
}
