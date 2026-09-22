#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int n,scenario=0;
    while(cin>>n&&n){
        vector<pair<long long,long long>> point(n);for(auto &p:point)cin>>p.first>>p.second;
        vector<long long> best(n,LLONG_MAX);vector<bool> used(n,false);best[0]=0;
        for(int step=0;step<n;++step){
            int u=-1;for(int i=0;i<n;++i)if(!used[i]&&(u<0||best[i]<best[u]))u=i;
            used[u]=true;if(u==1)break;
            for(int v=0;v<n;++v)if(!used[v]){
                long long dx=point[u].first-point[v].first,dy=point[u].second-point[v].second;
                best[v]=min(best[v],max(best[u],dx*dx+dy*dy));
            }
        }
        cout<<"Scenario #"<<++scenario<<'\n'<<"Frog Distance = "<<fixed<<setprecision(3)<<sqrtl(best[1])<<"\n\n";
    }
}
