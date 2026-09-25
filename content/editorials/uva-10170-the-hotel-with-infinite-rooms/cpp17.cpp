#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long start, day;
    while (cin >> start >> day) {
        long long low = start, high = 100000000;
        auto through = [&](long long size) { return (size - start + 1) * (start + size) / 2; };
        while (low < high) {
            long long mid = low + (high - low) / 2;
            if (through(mid) >= day) high = mid;
            else low = mid + 1;
        }
        cout << low << '\n';
    }
}
