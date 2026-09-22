#include <bits/stdc++.h>
using namespace std;
struct Fenwick {
    vector<int> tree;
    explicit Fenwick(int n): tree(n+1,0) {}
    void add(int at,int delta) { for (; at < (int)tree.size(); at += at & -at) tree[at] += delta; }
    int prefix(int at) const { int total = 0; for (; at > 0; at -= at & -at) total += tree[at]; return total; }
};
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n,m; cin >> n >> m; Fenwick occupied(n+m); vector<int> position(n+1); int top = m;
        for (int movie = 1; movie <= n; ++movie) { position[movie] = m+movie; occupied.add(position[movie],1); }
        for (int request = 0; request < m; ++request) {
            int movie; cin >> movie; if (request) cout << ' ';
            cout << occupied.prefix(position[movie]-1);
            occupied.add(position[movie],-1);
            position[movie] = top--; occupied.add(position[movie],1);
        }
        cout << '\n';
    }
}
