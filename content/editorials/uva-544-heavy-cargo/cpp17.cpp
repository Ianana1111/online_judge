#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,r,tc = 0;
    while (cin >> n >> r && (n || r)) {
        map<string,int> ids; vector<vector<int>> capacity(n,vector<int>(n,0));
        auto index = [&](const string &name) { auto found = ids.find(name); if (found != ids.end()) return found->second; int id = ids.size(); ids[name] = id; return id; };
        for (int i = 0; i < r; ++i) { string a,b; int w; cin >> a >> b >> w; int u = index(a),v = index(b); capacity[u][v] = capacity[v][u] = max(capacity[u][v],w); }
        string from,to; cin >> from >> to; int start = index(from),destination = index(to);
        vector<int> best(n,0); vector<bool> settled(n,false); best[start] = 10001;
        for (int step = 0; step < n; ++step) {
            int u = -1;
            for (int v = 0; v < n; ++v) if (!settled[v] && (u == -1 || best[v] > best[u])) u = v;
            if (u == -1 || best[u] == 0) break;
            settled[u] = true;
            for (int v = 0; v < n; ++v) best[v] = max(best[v],min(best[u],capacity[u][v]));
        }
        cout << "Scenario #" << ++tc << '\n' << best[destination] << " tons\n\n";
    }
}
