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
    ios::sync_with_stdio(false);cin.tie(nullptr);int tests;cin>>tests;
    for(int test=1;test<=tests;++test){
        int rows,columns;cin>>rows>>columns;vector<int> row(rows),column(columns);int previous=0;
        for(int &value:row){int cumulative;cin>>cumulative;value=cumulative-previous-columns;previous=cumulative;}
        previous=0;
        for(int &value:column){int cumulative;cin>>cumulative;value=cumulative-previous-rows;previous=cumulative;}
        int source=rows+columns,target=source+1;Dinic flow(target+1);vector<vector<int>> edge(rows,vector<int>(columns));
        for(int i=0;i<rows;++i){
            flow.add(source,i,row[i]);
            for(int j=0;j<columns;++j)edge[i][j]=flow.add(i,rows+j,19);
        }
        for(int j=0;j<columns;++j)flow.add(rows+j,target,column[j]);
        flow.maximum(source,target);
        if(test>1)cout<<'\n';cout<<"Matrix "<<test<<'\n';
        for(int i=0;i<rows;++i){
            for(int j=0;j<columns;++j){const auto &e=flow.graph[i][edge[i][j]];if(j)cout<<' ';cout<<1+e.initial-e.capacity;}
            cout<<'\n';
        }
    }
}
