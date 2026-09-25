#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    unsigned long long n, lower, upper;
    while (cin >> n >> lower >> upper) {
        unsigned long long mask = 0;
        for (int i = 31; i >= 0; --i) {
            unsigned long long bit = 1ULL << i;
            if ((n & bit) == 0) {
                if ((mask | bit) <= upper) mask |= bit;
            } else {
                if ((mask | (bit - 1)) < lower) mask |= bit;
            }
        }
        cout << mask << '\n';
    }
}
