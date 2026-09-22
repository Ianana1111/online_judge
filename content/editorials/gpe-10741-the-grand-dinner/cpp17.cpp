#include <bits/stdc++.h>
using namespace std;
struct Edge{int to,reverse,capacity,initial;};
struct Dinic{
    vector<vector<Edge>> graph;vector<int> level,next;
    explicit Dinic(int n):graph(n),level(n),next(n){}
    int add(int from,int to,int capacity){
        int index=graph[from].size(),reverse=graph[to].size();
        graph[from].push_back({to,reverse,capacity,capacity});graph[to].push_back({from,index,0,0});return index;
    }
    int send(int u,int target,int available){
        if(u==target)return available;
        for(int &i=next[u];i<(int)graph[u].size();++i){
            auto &e=graph[u][i];if(e.capacity<=0||level[e.to]!=level[u]+1)continue;
            int pushed=send(e.to,target,min(available,e.capacity));
            if(pushed){e.capacity-=pushed;graph[e.to][e.reverse].capacity+=pushed;return pushed;}
        }
        return 0;
    }
    int maximum(int source,int target){
        int total=0;
        while(true){
            fill(level.begin(),level.end(),-1);queue<int> q;level[source]=0;q.push(source);
            while(!q.empty()){int u=q.front();q.pop();for(auto &e:graph[u])if(e.capacity>0&&level[e.to]<0){level[e.to]=level[u]+1;q.push(e.to);}}
            if(level[target]<0)return total;
            fill(next.begin(),next.end(),0);
            while(int pushed=send(source,target,INT_MAX))total+=pushed;
        }
    }
};

int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int teams,tables;
    while(cin>>teams>>tables && (teams||tables)){
        vector<int> members(teams),seats(tables);for(int &x:members)cin>>x;for(int &x:seats)cin>>x;
        int source=teams+tables,target=source+1;Dinic flow(target+1);int required=0;
        vector<vector<int>> edge(teams,vector<int>(tables));
        for(int i=0;i<teams;++i){
            flow.add(source,i,members[i]);required+=members[i];
            for(int j=0;j<tables;++j)edge[i][j]=flow.add(i,teams+j,1);
        }
        for(int j=0;j<tables;++j)flow.add(teams+j,target,seats[j]);
        if(flow.maximum(source,target)!=required){cout<<"0\n";continue;}
        cout<<"1\n";
        for(int i=0;i<teams;++i){
            bool first=true;
            for(int j=0;j<tables;++j){const auto &e=flow.graph[i][edge[i][j]];for(int used=0;used<e.initial-e.capacity;++used){if(!first)cout<<' ';first=false;cout<<j+1;}}
            cout<<'\n';
        }
    }
}
