#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,m;
    while (cin >> n >> m) {
        vector<int> parent(n+m+1),size(n+m+1,0),weight(n+m+1,1),id(n+1); vector<long long> sum(n+m+1,0);
        iota(parent.begin(),parent.end(),0); iota(id.begin(),id.end(),0);
        for (int p = 1; p <= n; ++p) { size[p] = 1; sum[p] = p; }
        function<int(int)> root = [&](int v) { return parent[v] == v ? v : parent[v] = root(parent[v]); };
        int used = n;
        for (int i = 0; i < m; ++i) {
            int op,p; cin >> op >> p; int a = root(id[p]);
            if (op == 3) { cout << size[a] << ' ' << sum[a] << '\n'; continue; }
            int q; cin >> q; int b = root(id[q]); if (a == b) continue;
            if (op == 1) {
                if (weight[a] < weight[b]) swap(a,b);
                parent[b] = a; weight[a] += weight[b]; size[a] += size[b]; sum[a] += sum[b];
            } else {
                --size[a]; sum[a] -= p; ++size[b]; sum[b] += p;
                id[p] = ++used; parent[id[p]] = b; ++weight[b];
            }
        }
    }
}
