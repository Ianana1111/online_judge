#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int m,n;
    while (cin >> m) {
        string x,y; if (m) cin >> x; cin >> n; if (n) cin >> y;
        vector<int> previous(n+1),current(n+1); iota(previous.begin(),previous.end(),0);
        for (int i = 1; i <= m; ++i) {
            current[0] = i;
            for (int j = 1; j <= n; ++j) current[j] = min({previous[j] + 1,current[j-1] + 1,previous[j-1] + (x[i-1] != y[j-1])});
            swap(previous,current);
        }
        cout << previous[n] << '\n';
    }
}
