#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int digits;
    while (cin >> digits) {
        long long base = 1;
        for (int i = 0; i < digits / 2; ++i) base *= 10;
        for (long long root = 0; root < base; ++root) {
            long long value = root * root;
            long long left = value / base, right = value % base;
            if (left + right == root) cout << setfill('0') << setw(digits) << value << '\n';
        }
    }
}
