#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        int n; cin >> n; vector<int> weights(n); int total = 0;
        for (int &w : weights) { cin >> w; total += w; }
        int teamSize = n / 2;
        vector<bitset<45001>> possible(teamSize + 1); possible[0][0] = 1;
        int seen = 0;
        for (int w : weights) {
            ++seen;
            for (int count = min(seen, teamSize); count >= 1; --count)
                possible[count] |= possible[count - 1] << w;
        }
        int best = total + 1, low = 0, high = total;
        for (int sum = 0; sum <= total; ++sum) if (possible[teamSize][sum]) {
            int difference = abs(total - 2 * sum);
            if (difference < best) { best = difference; low = min(sum, total - sum); high = max(sum, total - sum); }
        }
        if (tc) cout << '\n';
        cout << low << ' ' << high << '\n';
    }
}
