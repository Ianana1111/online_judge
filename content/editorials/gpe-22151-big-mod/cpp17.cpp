#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long base, exponent, modulus;
    while (cin >> base >> exponent >> modulus) {
        base %= modulus; long long result = 1 % modulus;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % modulus;
            base = base * base % modulus; exponent >>= 1;
        }
        cout << result << '\n';
    }
}
