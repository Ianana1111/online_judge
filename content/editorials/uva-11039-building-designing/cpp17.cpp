#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<int> floors(n); for (int &x : floors) cin >> x;
        sort(floors.begin(), floors.end(), [](int a,int b) { return abs(a) < abs(b); });
        int answer = 0, previous = 0;
        for (int x : floors) {
            int color = x > 0 ? 1 : -1;
            if (color != previous) { ++answer; previous = color; }
        }
        cout << answer << '\n';
    }
}
