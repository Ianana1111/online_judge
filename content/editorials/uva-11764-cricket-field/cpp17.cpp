#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n; cin >> n;
        int previous; cin >> previous;
        int high = 0, low = 0;
        for (int i = 1; i < n; ++i) {
            int current; cin >> current;
            if (current > previous) ++high;
            else if (current < previous) ++low;
            previous = current;
        }
        cout << "Case " << tc << ": " << high << ' ' << low << '\n';
    }
}
