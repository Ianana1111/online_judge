#include <bits/stdc++.h>
using namespace std;
struct DSU {
    vector<int> parent, size;
    DSU(int n) : parent(n + 1), size(n + 1, 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
    bool join(int a, int b) {
        a = find(a); b = find(b); if (a == b) return false;
        if (size[a] < size[b]) swap(a,b);
        parent[b] = a; size[a] += size[b]; return true;
    }
};
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m, tc = 0;
    while (cin >> n >> m && (n || m)) {
        DSU dsu(n); int groups = n;
        while (m--) { int a,b; cin >> a >> b; if (dsu.join(a,b)) --groups; }
        cout << "Case " << ++tc << ": " << groups << '\n';
    }
}
