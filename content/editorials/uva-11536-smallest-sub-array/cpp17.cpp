#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    for (int tc=1;tc<=t;++tc) {
        int n,m,k; cin >> n >> m >> k;
        vector<int> values(n); values[0]=1;values[1]=2;values[2]=3;
        for (int i=3;i<n;++i) values[i]=(values[i-1]+values[i-2]+values[i-3])%m+1;
        vector<int> frequency(k+1); int left=0,covered=0,best=n+1;
        for (int right=0;right<n;++right) {
            int value=values[right];
            if (value<=k && ++frequency[value]==1) ++covered;
            while (covered==k) {
                best=min(best,right-left+1);
                int removed=values[left++];
                if (removed<=k && --frequency[removed]==0) --covered;
            }
        }
        cout << "Case " << tc << ": ";
        if (best>n) cout << "sequence nai\n";
        else cout << best << '\n';
    }
}
