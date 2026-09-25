#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
const int MOD=1000000007;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int answer[11][101]={};
    for (int base=2;base<=10;++base) {
        int full=(1<<base)-1;
        vector<vector<int>> dp(1<<base,vector<int>(base));
        for (int digit=1;digit<base;++digit) dp[1<<digit][digit]=1;
        for (int length=1;length<=100;++length) {
            int current=0;
            for (int digit=0;digit<base;++digit) current=(current+dp[full][digit])%MOD;
            answer[base][length]=(answer[base][length-1]+current)%MOD;
            vector<vector<int>> next(1<<base,vector<int>(base));
            for (int mask=0;mask<=full;++mask) for (int last=0;last<base;++last) if (dp[mask][last]) {
                for (int digit : {last-1,last+1}) if (0<=digit && digit<base) {
                    int &value=next[mask|(1<<digit)][digit];
                    value=(value+dp[mask][last])%MOD;
                }
            }
            dp.swap(next);
        }
    }
    int t; cin >> t;
    while (t--) { int base,length; cin >> base >> length; cout << answer[base][length] << '\n'; }
}
