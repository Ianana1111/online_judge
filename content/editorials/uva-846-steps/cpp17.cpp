#include <cmath>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        long long x,y; cin >> x >> y; long long distance = y - x;
        if (distance == 0) { cout << 0 << '\n'; continue; }
        long long root = sqrtl((long double)distance);
        while ((root + 1) * (root + 1) <= distance) ++root;
        while (root * root > distance) --root;
        if (distance == root * root) cout << 2 * root - 1 << '\n';
        else if (distance <= root * root + root) cout << 2 * root << '\n';
        else cout << 2 * root + 1 << '\n';
    }
}
