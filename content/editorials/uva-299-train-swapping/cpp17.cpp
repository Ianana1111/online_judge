#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<int> cars(n);
        for (int &x : cars) cin >> x;
        int swaps = 0;
        for (int i = 0; i < n; ++i)
            for (int j = i + 1; j < n; ++j) if (cars[i] > cars[j]) ++swaps;
        cout << "Optimal train swapping takes " << swaps << " swaps.\n";
    }
}
