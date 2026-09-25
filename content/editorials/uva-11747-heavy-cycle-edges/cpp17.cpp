#include <algorithm>
#include <iostream>
#include <numeric>
#include <tuple>
#include <vector>
using namespace std;
struct DSU{
    vector<int> parent,size;
    DSU(int n):parent(n),size(n,1){iota(parent.begin(),parent.end(),0);}
    int find(int u){return parent[u]==u?u:parent[u]=find(parent[u]);}
    bool unite(int u,int v){u=find(u);v=find(v);if(u==v)return false;if(size[u]<size[v])swap(u,v);parent[v]=u;size[u]+=size[v];return true;}
};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,m;
    while(cin>>n>>m && (n||m)){
        vector<tuple<int,int,int>> edges;vector<int> heavy;
        for(int i=0;i<m;++i){int u,v,w;cin>>u>>v>>w;edges.push_back({w,u,v});}
        sort(edges.begin(),edges.end());DSU dsu(n);
        for(auto [weight,u,v]:edges)if(!dsu.unite(u,v))heavy.push_back(weight);
        if(heavy.empty())cout<<"forest";
        else for(size_t i=0;i<heavy.size();++i){if(i)cout<<' ';cout<<heavy[i];}
        cout<<'\n';
    }
}
