#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while (t--) {
        int n;cin >> n;vector<vector<pair<int,int>>> graph(n);
        for (int i=1;i<n;++i) { int u,v,w;cin >> u >> v >> w;--u;--v;graph[u].emplace_back(v,w);graph[v].emplace_back(u,w); }
        vector<long long> frequency(n),subtree(n),cost(n),distance(n);
        int m;cin >> m;
        while (m--) { int u,f;cin >> u >> f;frequency[u-1]=f; }
        vector<int> parent(n,-1),edge(n),order={0};parent[0]=0;
        for (int index=0;index<(int)order.size();++index) {
            int u=order[index];
            for (auto [v,w]:graph[u]) if (v!=parent[u]) { parent[v]=u;edge[v]=w;distance[v]=distance[u]+w;order.push_back(v); }
        }
        long long total=0;
        for (int u=0;u<n;++u) { total+=frequency[u];cost[0]+=frequency[u]*distance[u];subtree[u]=frequency[u]; }
        for (int i=n-1;i>0;--i) { int u=order[i];subtree[parent[u]]+=subtree[u]; }
        for (int i=1;i<n;++i) {
            int v=order[i],u=parent[v];cost[v]=cost[u]+1LL*edge[v]*(total-2*subtree[v]);
        }
        long long minimum=*min_element(cost.begin(),cost.end());
        cout << 2*minimum << '\n';bool first=true;
        for (int u=0;u<n;++u) if (cost[u]==minimum) { if (!first) cout << ' ';first=false;cout << u+1; }
        cout << '\n';
    }
}
