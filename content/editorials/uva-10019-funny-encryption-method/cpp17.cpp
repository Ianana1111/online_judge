#include <iostream>
#include <string>
using namespace std;
int bits(int value) { int total = 0; while (value) { total += value % 2; value /= 2; } return total; }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string text; cin >> text; int decimal = 0, hexadecimal = 0;
        for (char ch : text) { decimal = decimal * 10 + ch - '0'; hexadecimal = hexadecimal * 16 + ch - '0'; }
        cout << bits(decimal) << ' ' << bits(hexadecimal) << '\n';
    }
}
