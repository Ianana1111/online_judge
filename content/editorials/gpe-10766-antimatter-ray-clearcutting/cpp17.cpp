#include <algorithm>
#include <iostream>
#include <set>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    for(int tc=1;tc<=t;++tc) {
        int n,m;cin >> n >> m;vector<pair<int,int>> p(n);for(auto &[x,y]:p)cin >> x >> y;
        set<int> unique;
        for(int i=0;i<n;++i) {
            int same=0;for(int k=0;k<n;++k)if(p[k]==p[i])same|=1<<k;
            unique.insert(same);
            for(int j=i+1;j<n;++j) {
                long long dx=p[j].first-p[i].first,dy=p[j].second-p[i].second;
                if(dx==0 && dy==0)continue;
                int line=0;
                for(int k=0;k<n;++k) {
                    long long x=p[k].first-p[i].first,y=p[k].second-p[i].second;
                    if(x*dy==y*dx)line|=1<<k;
                }
                unique.insert(line);
            }
        }
        vector<int> lines(unique.begin(),unique.end()),dp(1<<n,n+1);dp[0]=0;int answer=n;
        for(int mask=0;mask<(1<<n);++mask) {
            if(__builtin_popcount((unsigned)mask)>=m){answer=min(answer,dp[mask]);continue;}
            if(dp[mask]>=answer)continue;
            for(int line:lines) {
                int next=mask|line;
                if(next!=mask)dp[next]=min(dp[next],dp[mask]+1);
            }
        }
        if(tc>1)cout << '\n';
        cout << "Case #" << tc << ":\n" << answer << '\n';
    }
}
