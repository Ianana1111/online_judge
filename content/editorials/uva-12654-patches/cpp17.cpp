#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n,c,t1,t2;
    while (cin >> n >> c >> t1 >> t2) {
        vector<int> hole(2*n);for(int i=0;i<n;++i)cin >> hole[i];sort(hole.begin(),hole.begin()+n);
        for(int i=0;i<n;++i)hole[n+i]=hole[i]+c;
        int length[2]={t1,t2};vector<vector<int>> next(2,vector<int>(2*n));
        for(int kind=0;kind<2;++kind) {
            int pointer=0;
            for(int i=0;i<2*n;++i) {
                while(pointer<2*n && hole[pointer]<=hole[i]+length[kind])++pointer;
                next[kind][i]=pointer;
            }
        }
        vector<long long> dp(2*n+1);long long answer=LLONG_MAX;
        for(int start=0;start<n;++start) {
            int end=start+n;dp[end]=0;
            for(int i=end-1;i>=start;--i)
                dp[i]=min(t1+dp[min(end,next[0][i])],t2+dp[min(end,next[1][i])]);
            answer=min(answer,dp[start]);
        }
        cout << answer << '\n';
    }
}
