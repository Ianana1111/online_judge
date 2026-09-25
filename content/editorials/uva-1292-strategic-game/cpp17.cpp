#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<vector<int>> graph(n);
        for (int i=0;i<n;++i) {
            int u,k;char colon,open,close;cin >> u >> colon >> open >> k >> close;
            while (k--) { int v;cin >> v;graph[u].push_back(v);graph[v].push_back(u); }
        }
        vector<int> parent(n,-1),order={0};parent[0]=0;
        for (int i=0;i<(int)order.size();++i) {
            int u=order[i];
            for (int v:graph[u]) if (v!=parent[u]) { parent[v]=u;order.push_back(v); }
        }
        vector<int> off(n),on(n,1);
        for (int i=n-1;i>=0;--i) {
            int u=order[i];
            for (int v:graph[u]) if (parent[v]==u) {
                off[u]+=on[v];
                on[u]+=min(off[v],on[v]);
            }
        }
        cout << min(off[0],on[0]) << '\n';
    }
}
