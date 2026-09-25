#include <algorithm>
#include <climits>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n, highest; cin >> n >> highest; int answer = INT_MIN;
        for (int i = 1; i < n; ++i) {
            int current; cin >> current;
            answer = max(answer, highest - current);
            highest = max(highest, current);
        }
        cout << answer << '\n';
    }
}
