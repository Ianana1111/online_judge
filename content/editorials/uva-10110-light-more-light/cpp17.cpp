#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    unsigned long long n;
    while (cin >> n && n != 0) {
        unsigned long long low = 1, high = 65535;
        bool square = false;
        while (low <= high) {
            auto mid = low + (high - low) / 2;
            auto value = mid * mid;
            if (value == n) { square = true; break; }
            if (value < n) low = mid + 1;
            else high = mid - 1;
        }
        cout << (square ? "yes" : "no") << '\n';
    }
}
