#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,r,tc = 0; const int inf = 1000000;
    while (cin >> n >> r && (n || r)) {
        map<string,int> ids; vector<vector<int>> distance(n,vector<int>(n,inf));
        for (int i = 0; i < n; ++i) distance[i][i] = 0;
        auto index = [&](const string &name) { auto found = ids.find(name); if (found != ids.end()) return found->second; int id = ids.size(); ids[name] = id; return id; };
        for (int i = 0; i < r; ++i) { string a,b; cin >> a >> b; int u = index(a), v = index(b); distance[u][v] = distance[v][u] = 1; }
        for (int k = 0; k < n; ++k) for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) distance[i][j] = min(distance[i][j],distance[i][k] + distance[k][j]);
        int answer = 0;
        for (int i = 0; i < n; ++i) for (int j = 0; j < n; ++j) answer = max(answer,distance[i][j]);
        cout << "Network " << ++tc << ": ";
        if (answer == inf) cout << "DISCONNECTED"; else cout << answer;
        cout << "\n\n";
    }
}
