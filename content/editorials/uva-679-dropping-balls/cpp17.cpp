#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int depth, number; cin >> depth >> number; int node = 1;
        for (int level = 1; level < depth; ++level) {
            if (number % 2 == 1) { node = node * 2; number = (number + 1) / 2; }
            else { node = node * 2 + 1; number /= 2; }
        }
        cout << node << '\n';
    }
    int sentinel; cin >> sentinel;
}
