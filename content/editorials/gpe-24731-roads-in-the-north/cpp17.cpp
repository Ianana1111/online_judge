#include <bits/stdc++.h>
using namespace std;
using Graph = map<int, vector<pair<int,long long>>>;
pair<int,long long> farthest(const Graph& graph, int start) {
    vector<tuple<int,int,long long>> pending{{start, -1, 0}}; pair<int,long long> best{start,0};
    while (!pending.empty()) {
        auto [u, parent, distance] = pending.back(); pending.pop_back();
        if (distance > best.second) best = {u,distance};
        for (auto [v, length] : graph.at(u)) if (v != parent) pending.emplace_back(v,u,distance+length);
    }
    return best;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    Graph graph;
    auto solve = [&]() {
        if (graph.empty()) return;
        auto endpoint = farthest(graph, graph.begin()->first);
        cout << farthest(graph, endpoint.first).second << '\n'; graph.clear();
    };
    string line;
    while (getline(cin,line)) {
        stringstream input(line); int a,b; long long length;
        if (!(input >> a >> b >> length)) { solve(); continue; }
        graph[a].push_back({b,length}); graph[b].push_back({a,length});
    }
    solve();
}
