#include <algorithm>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        long long ending = 0, best = 0;
        for (int i = 0; i < n; ++i) {
            long long value; cin >> value;
            ending = max(0LL,ending + value); best = max(best,ending);
        }
        if (best > 0) cout << "The maximum winning streak is " << best << ".\n";
        else cout << "Losing streak.\n";
    }
}
