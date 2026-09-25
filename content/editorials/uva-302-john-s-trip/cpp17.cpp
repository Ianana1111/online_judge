#include <algorithm>
#include <functional>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int x,y;
    while(cin>>x>>y && (x||y)){
        int start=min(x,y);vector<vector<pair<int,int>>> graph(45);int edges=0;
        do{int id;cin>>id;graph[x].push_back({id,y});graph[y].push_back({id,x});++edges;cin>>x>>y;}while(x||y);
        bool possible=true;for(auto &row:graph){if(row.size()%2)possible=false;sort(row.begin(),row.end());}
        vector<bool> used(1995);vector<int> next(45),route;
        function<void(int)> visit=[&](int u){
            while(next[u]<(int)graph[u].size()){
                auto [id,v]=graph[u][next[u]++];if(used[id])continue;
                used[id]=true;visit(v);route.push_back(id);
            }
        };
        if(possible)visit(start);
        if(!possible||(int)route.size()!=edges)cout<<"Round trip does not exist.\n\n";
        else{
            reverse(route.begin(),route.end());
            for(int i=0;i<edges;++i){if(i)cout<<' ';cout<<route[i];}
            cout<<"\n\n";
        }
    }
}
