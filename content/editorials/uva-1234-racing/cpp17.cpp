#include <algorithm>
#include <iostream>
#include <numeric>
#include <tuple>
#include <vector>
using namespace std;
struct DSU {
    vector<int> parent, size;
    DSU(int n):parent(n+1),size(n+1,1){iota(parent.begin(),parent.end(),0);}
    int find(int x){return parent[x]==x?x:parent[x]=find(parent[x]);}
    bool unite(int a,int b){
        a=find(a);b=find(b);if(a==b)return false;
        if(size[a]<size[b])swap(a,b);parent[b]=a;size[a]+=size[b];return true;
    }
};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int cases;cin>>cases;
    while(cases--){
        int n,m;cin>>n>>m;vector<tuple<int,int,int>> edges;
        for(int i=0;i<m;++i){int u,v,w;cin>>u>>v>>w;edges.push_back({w,u,v});}
        sort(edges.rbegin(),edges.rend());DSU dsu(n);long long answer=0;
        for(auto [cost,u,v]:edges)if(!dsu.unite(u,v))answer+=cost;
        cout<<answer<<'\n';
    }
}
