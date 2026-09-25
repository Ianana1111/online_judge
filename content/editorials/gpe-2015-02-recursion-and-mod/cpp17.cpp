#include <iostream>
using namespace std;
const long long MOD = 1000000009LL;

long long power(long long base, unsigned long long exponent) {
    long long result = 1;
    while (exponent > 0) {
        if (exponent & 1) result = result * base % MOD;
        base = base * base % MOD;
        exponent >>= 1;
    }
    return result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    unsigned long long n;
    while (cin >> n) cout << (power(3, n) - 2 + MOD) % MOD << '\n';
}
