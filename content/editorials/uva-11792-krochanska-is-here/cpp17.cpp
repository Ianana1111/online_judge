#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while (t--) {
        int n,s;cin >> n >> s;vector<vector<int>> graph(n);vector<int> lines(n);
        while (s--) {
            vector<bool> seen(n);int previous=-1,v;
            while (cin >> v && v) {
                --v;if (!seen[v]) { seen[v]=true;++lines[v]; }
                if (previous!=-1) { graph[previous].push_back(v);graph[v].push_back(previous); }
                previous=v;
            }
        }
        vector<int> important;
        for (int u=0;u<n;++u) if (lines[u]>1) important.push_back(u);
        long long best=LLONG_MAX;int answer=-1;
        for (int start:important) {
            vector<int> distance(n,-1);queue<int> q;distance[start]=0;q.push(start);
            while (!q.empty()) {
                int u=q.front();q.pop();
                for (int v:graph[u]) if (distance[v]<0) { distance[v]=distance[u]+1;q.push(v); }
            }
            long long sum=0;for (int v:important) sum+=distance[v];
            if (sum<best) { best=sum;answer=start; }
        }
        cout << "Krochanska is in: " << answer+1 << '\n';
    }
}
