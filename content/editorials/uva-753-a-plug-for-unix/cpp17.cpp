#include <bits/stdc++.h>
using namespace std;
struct Dinic {
    struct Edge { int to,rev,cap; };
    vector<vector<Edge>> graph;vector<int> level,next;
    Dinic(int n):graph(n),level(n),next(n) {}
    void add(int u,int v,int cap) {
        int a=graph[u].size(),b=graph[v].size();
        if (u==v) ++b;
        graph[u].push_back({v,b,cap});graph[v].push_back({u,a,0});
    }
    int send(int u,int sink,int amount) {
        if (u==sink) return amount;
        for (int &i=next[u];i<(int)graph[u].size();++i) {
            Edge &e=graph[u][i];
            if (e.cap && level[e.to]==level[u]+1) {
                int sent=send(e.to,sink,min(amount,e.cap));
                if (sent) { e.cap-=sent;graph[e.to][e.rev].cap+=sent;return sent; }
            }
        }
        return 0;
    }
    int flow(int source,int sink) {
        int total=0;
        while (true) {
            fill(level.begin(),level.end(),-1);queue<int> q;q.push(source);level[source]=0;
            while (!q.empty()) {
                int u=q.front();q.pop();
                for (auto e:graph[u]) if (e.cap && level[e.to]<0) { level[e.to]=level[u]+1;q.push(e.to); }
            }
            if (level[sink]<0) return total;
            fill(next.begin(),next.end(),0);
            while (int sent=send(source,sink,100)) total+=sent;
        }
    }
};
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    for (int tc=0;tc<t;++tc) {
        map<string,int> ids;
        auto id=[&](const string &s) { auto it=ids.find(s);if(it!=ids.end())return it->second;int value=ids.size();ids[s]=value;return value; };
        int n,m,k;cin >> n;vector<int> outlets(n);
        for (int &v:outlets) { string s;cin >> s;v=id(s); }
        cin >> m;vector<int> devices(m);
        for (int &v:devices) { string name,s;cin >> name >> s;v=id(s); }
        cin >> k;vector<pair<int,int>> adapters;
        while (k--) { string a,b;cin >> a >> b;adapters.emplace_back(id(a),id(b)); }
        int source=ids.size(),sink=source+1;Dinic network(sink+1);
        for (int v:devices) network.add(source,v,1);
        for (int v:outlets) network.add(v,sink,1);
        for (auto [u,v]:adapters) network.add(u,v,m);
        if (tc) cout << '\n';
        cout << m-network.flow(source,sink) << '\n';
    }
}
