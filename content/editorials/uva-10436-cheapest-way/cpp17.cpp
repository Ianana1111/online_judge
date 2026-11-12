#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const long long INF = 1LL << 60;
    int maps;
    if (!(cin >> maps)) return 0;
    for (int m = 1; m <= maps; ++m) {
        int n;
        cin >> n;
        vector<string> name(n);
        vector<long long> fee(n);
        map<string, int> id;
        for (int i = 0; i < n; ++i) { cin >> name[i] >> fee[i]; id[name[i]] = i; }
        vector<vector<long long>> road(n, vector<long long>(n, INF));
        int paths;
        cin >> paths;
        for (int e = 0; e < paths; ++e) {
            string s, t;
            long long km;
            cin >> s >> t >> km;
            int u = id[s], v = id[t];
            if (km < road[u][v]) road[u][v] = road[v][u] = km;
        }
        if (m > 1) cout << '\n';
        cout << "Map #" << m << '\n';
        int queries;
        cin >> queries;
        for (int q = 1; q <= queries; ++q) {
            string s, t;
            long long passengers;
            cin >> s >> t >> passengers;
            int src = id[s], dst = id[t];
            vector<long long> cost(n, INF);
            vector<int> prev(n, -1);
            vector<bool> done(n, false);
            cost[src] = fee[src];
            for (int round = 0; round < n; ++round) {
                int x = -1;
                for (int i = 0; i < n; ++i)
                    if (!done[i] && cost[i] < INF && (x < 0 || cost[i] < cost[x])) x = i;
                if (x < 0) break;
                done[x] = true;
                for (int y = 0; y < n; ++y)
                    if (road[x][y] < INF && cost[x] + 2 * road[x][y] + fee[y] < cost[y]) {
                        cost[y] = cost[x] + 2 * road[x][y] + fee[y];
                        prev[y] = x;
                    }
            }
            vector<int> path;
            for (int x = dst; x != -1; x = prev[x]) path.push_back(x);
            cout << "Query #" << q << '\n';
            for (int i = static_cast<int>(path.size()) - 1; i >= 0; --i)
                cout << name[path[i]] << (i == 0 ? '\n' : ' ');
            long long cents = (cost[dst] * 220 + passengers) / (2 * passengers);
            cout << "Each passenger has to pay : " << cents / 100 << '.'
                 << cents % 100 / 10 << cents % 10 << " taka\n";
        }
    }
}
