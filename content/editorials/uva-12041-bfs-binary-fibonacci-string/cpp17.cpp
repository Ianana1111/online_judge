#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long length[48]={1,1};
    for (int n=2;n<=47;++n) length[n]=length[n-2]+length[n-1];
    auto at=[&](int level,long long position) {
        while (level>=2) {
            long long split=length[level-2];
            if (position<split) level-=2;
            else { position-=split; --level; }
        }
        return char('0'+level);
    };
    int t; cin >> t;
    while (t--) {
        long long n,left,right; cin >> n >> left >> right;
        if (n>47) n=46+(n-46)%2;
        string answer; answer.reserve(right-left+1);
        for (long long position=left;position<=right;++position) answer.push_back(at((int)n,position));
        cout << answer << '\n';
    }
}
