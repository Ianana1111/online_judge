#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, containers;
    while (cin >> n >> containers) {
        vector<long long> vessels(n); long long low = 0, high = 0;
        for (auto &milk : vessels) { cin >> milk; low = max(low,milk); high += milk; }
        auto feasible = [&](long long capacity) {
            int used = 1; long long current = 0;
            for (long long milk : vessels) {
                if (current + milk > capacity) { ++used; current = 0; }
                current += milk;
            }
            return used <= containers;
        };
        while (low < high) {
            long long mid = low + (high - low) / 2;
            if (feasible(mid)) high = mid; else low = mid + 1;
        }
        cout << low << '\n';
    }
}
