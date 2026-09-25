#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, roads, tc = 0;
    while (cin >> n >> roads && (n || roads)) {
        vector<vector<long long>> capacity(n + 1, vector<long long>(n + 1));
        for (int i = 1; i <= n; ++i) capacity[i][i] = LLONG_MAX;
        while (roads--) {
            int a,b; long long seats; cin >> a >> b >> seats;
            capacity[a][b] = capacity[b][a] = max(capacity[a][b], seats);
        }
        int start, destination; long long tourists; cin >> start >> destination >> tourists;
        for (int via = 1; via <= n; ++via)
            for (int a = 1; a <= n; ++a)
                for (int b = 1; b <= n; ++b)
                    capacity[a][b] = max(capacity[a][b], min(capacity[a][via], capacity[via][b]));
        long long usable = capacity[start][destination] - 1;
        long long trips = start == destination ? 0 : tourists / usable + (tourists % usable != 0);
        cout << "Scenario #" << ++tc << "\nMinimum Number of Trips = " << trips << "\n\n";
    }
}
