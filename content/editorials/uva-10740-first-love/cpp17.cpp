#include <bits/stdc++.h>
using namespace std;
using ll=long long;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,m;
    while(cin>>n>>m && (n||m)){
        int source,target,k;cin>>source>>target>>k;--source;--target;
        vector<vector<pair<int,int>>> graph(n);
        for(int i=0;i<m;++i){int u,v,w;cin>>u>>v>>w;graph[u-1].push_back({v-1,w});}
        priority_queue<pair<ll,int>,vector<pair<ll,int>>,greater<pair<ll,int>>> pending;
        vector<int> popped(n);pending.push({0,source});ll answer=-1;
        while(!pending.empty()){
            auto [distance,u]=pending.top();pending.pop();
            if(popped[u]>=k)continue;
            ++popped[u];
            if(u==target&&popped[u]==k){answer=distance;break;}
            for(auto [v,w]:graph[u])pending.push({distance+w,v});
        }
        cout<<answer<<'\n';
    }
}
