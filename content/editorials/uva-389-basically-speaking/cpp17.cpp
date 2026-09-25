#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const string digits = "0123456789ABCDEF";
    string text; int from, to;
    while (cin >> text >> from >> to) {
        long long modulus = 1;
        for (int i = 0; i < 7; ++i) modulus *= to;
        long long value = 0;
        for (char ch : text) value = (value * from + digits.find(ch)) % modulus;
        string output(7, '0');
        for (int i = 6; i >= 0; --i) { output[i] = digits[value % to]; value /= to; }
        cout << output << '\n';
    }
}
