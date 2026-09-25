#include <bitset>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    for (int tc=1;tc<=t;++tc) {
        int n,k; cin >> n >> k;
        vector<bitset<300>> row(n); bool valid=true;
        while (k--) { int u,v; cin >> u >> v; row[u][v]=true; }
        for (int u=0;u<n;++u) for (int v=u+1;v<n;++v) {
            if ((row[u]&row[v]).any() && row[u]!=row[v]) valid=false;
        }
        cout << "Case #" << tc << ": " << (valid?"Yes":"No") << '\n';
    }
}
