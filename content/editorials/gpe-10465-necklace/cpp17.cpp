#include <algorithm>
#include <cmath>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;
struct Edge{int to,reverse,capacity;};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,m,tc=0;
    while(cin>>n>>m && (n||m)){
        vector<vector<Edge>> graph(n);
        for(int i=0;i<m;++i){
            int a,b;cin>>a>>b;--a;--b;
            int ai=graph[a].size(),bi=graph[b].size();
            graph[a].push_back({b,bi,1});graph[b].push_back({a,ai,1});
        }
        int source,target;cin>>source>>target;--source;--target;int flow=0;
        for(int round=0;round<2;++round){
            vector<int> parent(n,-1),edge(n,-1);queue<int> q;
            parent[source]=source;q.push(source);
            while(!q.empty()&&parent[target]<0){
                int u=q.front();q.pop();
                for(int i=0;i<(int)graph[u].size();++i){
                    const auto &e=graph[u][i];
                    if(e.capacity>0&&parent[e.to]<0){parent[e.to]=u;edge[e.to]=i;q.push(e.to);}
                }
            }
            if(parent[target]<0)break;
            for(int v=target;v!=source;v=parent[v]){
                int u=parent[v];auto &e=graph[u][edge[v]];
                --e.capacity;++graph[v][e.reverse].capacity;
            }
            ++flow;
        }
        cout<<"Case "<<++tc<<": "<<(flow==2?"YES":"NO")<<'\n';
    }
}
