#include <algorithm>
#include <climits>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int n;
    while(cin>>n){
        vector<pair<long long,long long>> point(n);for(auto &p:point)cin>>p.first>>p.second;
        vector<vector<bool>> connected(n,vector<bool>(n));int m;cin>>m;
        for(int i=0;i<m;++i){int a,b;cin>>a>>b;connected[a-1][b-1]=connected[b-1][a-1]=true;}
        vector<long long> best(n,LLONG_MAX);vector<bool> used(n,false);best[0]=0;long double total=0;
        for(int step=0;step<n;++step){
            int u=-1;for(int i=0;i<n;++i)if(!used[i]&&(u<0||best[i]<best[u]))u=i;
            used[u]=true;total+=sqrtl(best[u]);
            for(int v=0;v<n;++v)if(!used[v]){
                long long dx=point[u].first-point[v].first,dy=point[u].second-point[v].second;
                long long weight=connected[u][v]?0:dx*dx+dy*dy;
                best[v]=min(best[v],weight);
            }
        }
        cout<<fixed<<setprecision(2)<<total<<'\n';
    }
}
