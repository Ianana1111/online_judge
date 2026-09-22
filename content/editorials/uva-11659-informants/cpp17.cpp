#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,a;
    while (cin >> n >> a && (n || a)) {
        vector<int> positive(n),negative(n);
        while (a--) {
            int x,y; cin >> x >> y; --x;
            if (y>0) positive[x] |= 1<<(y-1);
            else negative[x] |= 1<<(-y-1);
        }
        int best=0;
        for (int mask=0;mask<(1<<n);++mask) {
            int count=__builtin_popcount((unsigned)mask);
            if (count<=best) continue;
            bool valid=true;
            for (int i=0;i<n && valid;++i) if (mask&(1<<i)) {
                if ((positive[i]&mask)!=positive[i] || (negative[i]&mask)) valid=false;
            }
            if (valid) best=count;
            if (best==n) break;
        }
        cout << best << '\n';
    }
}
