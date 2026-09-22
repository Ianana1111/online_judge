#include <bits/stdc++.h>
using namespace std;
struct DSU{vector<int> p,s;DSU(int n):p(n),s(n,1){iota(p.begin(),p.end(),0);}int find(int a){return p[a]==a?a:p[a]=find(p[a]);}bool join(int a,int b){a=find(a);b=find(b);if(a==b)return false;if(s[a]<s[b])swap(a,b);p[b]=a;s[a]+=s[b];return true;}};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int tests;cin>>tests;
    while(tests--){
        int satellites,n;cin>>satellites>>n;vector<pair<long long,long long>> point(n);for(auto &p:point)cin>>p.first>>p.second;
        vector<tuple<long long,int,int>> edges;
        for(int i=0;i<n;++i)for(int j=i+1;j<n;++j){long long dx=point[i].first-point[j].first,dy=point[i].second-point[j].second;edges.push_back({dx*dx+dy*dy,i,j});}
        sort(edges.begin(),edges.end());DSU sets(n);int chosen=0;long long answer=0;
        for(auto [square,a,b]:edges)if(sets.join(a,b)){answer=square;if(++chosen==n-satellites)break;}
        cout<<fixed<<setprecision(2)<<sqrtl(answer)<<'\n';
    }
}
