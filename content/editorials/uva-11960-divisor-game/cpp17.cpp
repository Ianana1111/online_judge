#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    vector<int> queries(t); int limit=1;
    for (int &n:queries) { cin >> n; limit=max(limit,n); }
    vector<int> divisors(limit+1),best(limit+1);
    for (int divisor=1;divisor<=limit;++divisor) {
        for (int multiple=divisor;multiple<=limit;multiple+=divisor) ++divisors[multiple];
    }
    int record=1;
    for (int n=1;n<=limit;++n) {
        if (divisors[n]>=divisors[record]) record=n;
        best[n]=record;
    }
    for (int n:queries) cout << best[n] << '\n';
}
