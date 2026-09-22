#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    const int INF=100000000;int n;
    while (cin >> n && n) {
        string line;getline(cin,line);
        auto readGraph=[&]() {
            vector<vector<int>> g(n,vector<int>(n,INF));
            for (int u=0;u<n;++u) g[u][u]=0;
            for (int row=0;row<n;++row) {
                do { getline(cin,line); } while (line.empty());
                stringstream stream(line);int u,v;stream >> u;--u;
                while (stream >> v) { --v;g[u][v]=1; }
            }
            for (int k=0;k<n;++k) for (int u=0;u<n;++u) for (int v=0;v<n;++v)
                g[u][v]=min(g[u][v],g[u][k]+g[k][v]);
            return g;
        };
        auto old=readGraph(),proposal=readGraph();int a,b;cin >> a >> b;
        bool valid=true;int diameter=0;
        for (int u=0;u<n;++u) for (int v=0;v<n;++v) {
            diameter=max(diameter,old[u][v]);
            if (proposal[u][v]==INF || proposal[u][v]>a*old[u][v]+b) valid=false;
        }
        cout << (valid?"Yes":"No") << ' ' << diameter << '\n';
    }
}
