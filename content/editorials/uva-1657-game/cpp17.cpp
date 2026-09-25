#include <algorithm>
#include <iostream>
#include <map>
#include <utility>
#include <vector>
using namespace std;
using Pair=pair<int,int>;
vector<vector<Pair>> solve(int n){
    vector<Pair> pairs;for(int x=1;x<=n;++x)for(int y=x+1;y<=n;++y)pairs.push_back({x,y});
    vector<vector<Pair>> answers(101);vector<char> alive(pairs.size(),true);int emptyRounds=0;
    for(int turn=0;turn<=100;++turn){
        vector<int> count(n*n+1,0);
        auto value=[&](Pair p){return turn%2==0?p.first+p.second:p.first*p.second;};
        for(int i=0;i<(int)pairs.size();++i)if(alive[i])++count[value(pairs[i])];
        vector<int> remove;
        for(int i=0;i<(int)pairs.size();++i)if(alive[i]&&count[value(pairs[i])]==1){answers[turn].push_back(pairs[i]);remove.push_back(i);}
        for(int i:remove)alive[i]=false;
        emptyRounds=remove.empty()?emptyRounds+1:0;
        if(emptyRounds==2)break;
    }
    return answers;
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int n,m;map<int,vector<vector<Pair>>> cache;
    while(cin>>n>>m){
        if(!cache.count(n))cache[n]=solve(n);const auto &answer=cache[n][m];
        cout<<answer.size()<<'\n';for(auto [x,y]:answer)cout<<x<<' '<<y<<'\n';
    }
}
