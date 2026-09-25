#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int m, n, t;
    while (cin >> m >> n >> t) {
        vector<int> best(t + 1, -1); best[0] = 0;
        for (int time = 1; time <= t; ++time) {
            if (time >= m && best[time - m] >= 0) best[time] = max(best[time], best[time - m] + 1);
            if (time >= n && best[time - n] >= 0) best[time] = max(best[time], best[time - n] + 1);
        }
        int used = t; while (best[used] < 0) --used;
        cout << best[used]; if (used < t) cout << ' ' << t - used; cout << '\n';
    }
}
