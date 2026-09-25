#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <set>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<int> state(n);
        for (int &x : state) cin >> x;
        set<vector<int>> seen;
        while (true) {
            if (all_of(state.begin(), state.end(), [](int x) { return x == 0; })) { cout << "ZERO\n"; break; }
            if (!seen.insert(state).second) { cout << "LOOP\n"; break; }
            vector<int> next(n);
            for (int i = 0; i < n; ++i) next[i] = abs(state[i] - state[(i + 1) % n]);
            state = move(next);
        }
    }
}
