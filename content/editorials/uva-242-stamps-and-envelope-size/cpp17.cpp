#include <algorithm>
#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
int coverage(int limit,const vector<int>& stamps) {
    int maximum=limit*stamps.back();vector<int> dp(maximum+1,limit+1);dp[0]=0;
    for(int amount=1;amount<=maximum;++amount) {
        for(int coin:stamps)if(coin<=amount)dp[amount]=min(dp[amount],dp[amount-coin]+1);
        if(dp[amount]>limit)return amount-1;
    }
    return maximum;
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int limit;
    while(cin>>limit&&limit) {
        int n;cin>>n;int bestCoverage=-1;vector<int> best;
        while(n--) {
            int k;cin>>k;vector<int> candidate(k);for(int& coin:candidate)cin>>coin;
            int covered=coverage(limit,candidate);
            bool better=covered>bestCoverage;
            if(covered==bestCoverage) {
                if(candidate.size()!=best.size())better=candidate.size()<best.size();
                else better=lexicographical_compare(candidate.rbegin(),candidate.rend(),best.rbegin(),best.rend());
            }
            if(better){bestCoverage=covered;best=candidate;}
        }
        cout<<"max coverage ="<<setw(4)<<bestCoverage<<" :";
        for(int coin:best)cout<<setw(3)<<coin;
        cout<<'\n';
    }
}
