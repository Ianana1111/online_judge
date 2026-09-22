#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    vector<vector<int>> edges(101);vector<int> indegree(101);set<int> vertices;
    int u,v,tc=0;
    while(cin>>u>>v){
        if(u<0&&v<0)break;
        if(u==0&&v==0){
            bool good=true;vector<int> roots;
            for(int x:vertices){if(indegree[x]==0)roots.push_back(x);else if(indegree[x]!=1)good=false;}
            if(!vertices.empty()&&roots.size()!=1)good=false;
            int root=roots.empty()?0:roots[0];set<int> visited;
            if(good&&!vertices.empty()){
                queue<int> pending;pending.push(root);visited.insert(root);
                while(!pending.empty()){
                    int x=pending.front();pending.pop();
                    for(int y:edges[x])if(visited.insert(y).second)pending.push(y);
                }
                if(visited.size()!=vertices.size())good=false;
            }
            cout<<"Case "<<++tc<<" is "<<(good?"a tree.":"not a tree.");
            if(good&&!vertices.empty())cout<<" Root is "<<root<<'.';
            cout<<'\n';
            for(auto &row:edges)row.clear();fill(indegree.begin(),indegree.end(),0);vertices.clear();
        }else{edges[u].push_back(v);++indegree[v];vertices.insert(u);vertices.insert(v);}
    }
}
