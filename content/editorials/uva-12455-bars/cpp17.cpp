#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int target, p; cin >> target >> p; vector<char> possible(target + 1, false); possible[0] = true;
        for (int i = 0; i < p; ++i) {
            long long length; cin >> length;
            if (length > target) continue;
            for (int sum = target; sum >= length; --sum) possible[sum] = possible[sum] || possible[sum - length];
        }
        cout << (possible[target] ? "YES" : "NO") << '\n';
    }
}
