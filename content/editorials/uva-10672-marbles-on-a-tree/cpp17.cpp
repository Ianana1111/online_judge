#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<vector<int>> children(n); vector<int> parent(n,-1), balance(n);
        for (int i = 0; i < n; ++i) {
            int v, marbles, count; cin >> v >> marbles >> count; --v; balance[v] = marbles - 1;
            while (count--) { int child; cin >> child; --child; children[v].push_back(child); parent[child] = v; }
        }
        int root = int(find(parent.begin(),parent.end(),-1) - parent.begin());
        vector<int> order{root};
        for (size_t i = 0; i < order.size(); ++i) for (int child : children[order[i]]) order.push_back(child);
        long long moves = 0;
        for (int i = n - 1; i > 0; --i) {
            int v = order[i]; moves += llabs(balance[v]); balance[parent[v]] += balance[v];
        }
        cout << moves << '\n';
    }
}
