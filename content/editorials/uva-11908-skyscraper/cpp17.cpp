#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
struct Advertisement { int start,end,profit; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n; cin >> n; vector<Advertisement> ads(n);
        for (auto &ad : ads) { int length; cin >> ad.start >> length >> ad.profit; ad.end = ad.start + length; }
        sort(ads.begin(),ads.end(),[](const auto &a,const auto &b) { return a.end < b.end; });
        vector<int> ends(n); for (int i = 0; i < n; ++i) ends[i] = ads[i].end;
        vector<long long> best(n+1,0);
        for (int i = 1; i <= n; ++i) {
            const auto &ad = ads[i-1];
            int compatible = upper_bound(ends.begin(),ends.begin()+i-1,ad.start) - ends.begin();
            best[i] = max(best[i-1],best[compatible] + ad.profit);
        }
        cout << "Case " << tc << ": " << best[n] << '\n';
    }
}
