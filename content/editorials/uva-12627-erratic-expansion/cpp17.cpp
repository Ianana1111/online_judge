#include <bits/stdc++.h>
using namespace std;
long long power3[31];
long long prefix(int k,long long rows) {
    if (rows==0) return 0;
    if (k==0) return 1;
    long long half=1LL<<(k-1);
    if (rows<=half) return 2*prefix(k-1,rows);
    return 2*power3[k-1]+prefix(k-1,rows-half);
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    power3[0]=1;for(int i=1;i<=30;++i) power3[i]=power3[i-1]*3;
    int t;cin >> t;
    for(int tc=1;tc<=t;++tc) {
        int k;long long a,b;cin >> k >> a >> b;
        long long result=prefix(k,b)-prefix(k,a-1);
        cout << "Case " << tc << ": " << result << '\n';
    }
}
