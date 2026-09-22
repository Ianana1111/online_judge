#include <bits/stdc++.h>
using namespace std;
struct Dinic {
    struct Edge {int to,reverse,capacity;};
    vector<vector<Edge>> graph;vector<int> level,next;
    explicit Dinic(int n):graph(n),level(n),next(n){}
    void add(int u,int v,int capacity){int a=graph[u].size(),b=graph[v].size();graph[u].push_back({v,b,capacity});graph[v].push_back({u,a,0});}
    bool bfs(int source,int sink){fill(level.begin(),level.end(),-1);queue<int> q;q.push(source);level[source]=0;while(!q.empty()){int u=q.front();q.pop();for(const Edge& e:graph[u])if(e.capacity&&level[e.to]<0){level[e.to]=level[u]+1;q.push(e.to);}}return level[sink]>=0;}
    int dfs(int u,int sink,int amount){if(u==sink)return amount;for(int& i=next[u];i<(int)graph[u].size();++i){Edge& e=graph[u][i];if(e.capacity&&level[e.to]==level[u]+1){int sent=dfs(e.to,sink,min(amount,e.capacity));if(sent){e.capacity-=sent;graph[e.to][e.reverse].capacity+=sent;return sent;}}}return 0;}
    int flow(int source,int sink,int limit){int total=0;while(total<limit&&bfs(source,sink)){fill(next.begin(),next.end(),0);while(total<limit){int sent=dfs(source,sink,limit-total);if(!sent)break;total+=sent;}}return total;}
};
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,m;
    while(cin>>n>>m) {
        vector<vector<bool>> adjacent(n,vector<bool>(n,false));
        for(int i=0;i<m;++i){char left,comma,right;int u,v;cin>>left>>u>>comma>>v>>right;adjacent[u][v]=adjacent[v][u]=true;}
        if(n<=1){cout<<n<<'\n';continue;}
        int answer=n;bool complete=true;
        for(int u=0;u<n;++u){int degree=count(adjacent[u].begin(),adjacent[u].end(),true);answer=min(answer,degree);if(degree<n-1)complete=false;}
        if(complete){cout<<n<<'\n';continue;}
        for(int source=0;source<n&&answer>0;++source)for(int sink=source+1;sink<n&&answer>0;++sink) {
            if(adjacent[source][sink])continue;
            Dinic network(2*n);
            for(int v=0;v<n;++v)network.add(2*v,2*v+1,(v==source||v==sink)?n:1);
            for(int u=0;u<n;++u)for(int v=0;v<n;++v)if(adjacent[u][v])network.add(2*u+1,2*v,n);
            answer=min(answer,network.flow(2*source+1,2*sink,answer));
        }
        cout<<answer<<'\n';
    }
}
