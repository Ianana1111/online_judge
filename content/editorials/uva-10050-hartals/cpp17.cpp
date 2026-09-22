#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int days, parties; cin >> days >> parties;
        vector<bool> stopped(days + 1, false);
        while (parties--) {
            long long period; cin >> period;
            for (long long day = period; day <= days; day += period) stopped[day] = true;
        }
        int lost = 0;
        for (int day = 1; day <= days; ++day)
            if (stopped[day] && day % 7 != 6 && day % 7 != 0) ++lost;
        cout << lost << '\n';
    }
}
