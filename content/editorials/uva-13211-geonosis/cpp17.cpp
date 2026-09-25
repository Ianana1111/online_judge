#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--){
        int n;cin>>n;vector<vector<int>> d(n,vector<int>(n));
        for(auto &row:d)for(int &w:row)cin>>w;
        vector<int> order(n),active;
        for(int &v:order)cin>>v;
        long long answer=0;
        for(int step=n-1;step>=0;--step){
            int k=order[step];active.push_back(k);
            for(int u=0;u<n;++u)for(int v=0;v<n;++v)
                d[u][v]=min(d[u][v],d[u][k]+d[k][v]);
            for(int u:active)for(int v:active)answer+=d[u][v];
        }
        cout<<answer<<'\n';
    }
}
