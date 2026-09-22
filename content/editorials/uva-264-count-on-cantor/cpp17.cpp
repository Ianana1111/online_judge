#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n;
    while (cin >> n) {
        long long low = 1, high = 10000;
        while (low < high) {
            long long mid = (low + high) / 2;
            if (mid * (mid + 1) / 2 >= n) high = mid;
            else low = mid + 1;
        }
        long long diagonal = low, offset = n - diagonal * (diagonal - 1) / 2;
        long long numerator = diagonal % 2 ? diagonal + 1 - offset : offset;
        long long denominator = diagonal + 1 - numerator;
        cout << "TERM " << n << " IS " << numerator << '/' << denominator << '\n';
    }
}
