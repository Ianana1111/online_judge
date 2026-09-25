#include <cmath>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        long long n; cin >> n;
        if (n <= 0) { cout << 0 << '\n'; continue; }
        long long root = sqrtl((long double)n);
        while ((root + 1) * (root + 1) <= n) ++root;
        while (root * root > n) --root;
        long long sum = 0;
        for (long long i = 1; i <= root; ++i) sum += n / i;
        cout << 2 * sum - root * root << '\n';
    }
}
