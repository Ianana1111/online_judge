#include <algorithm>
#include <iostream>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    unsigned int value;
    while (cin >> value && value != 0) {
        string bits;
        int ones = 0;
        while (value > 0) {
            unsigned int bit = value % 2;
            bits += char('0' + bit);
            ones += bit;
            value /= 2;
        }
        reverse(bits.begin(), bits.end());
        cout << "The parity of " << bits << " is " << ones << " (mod 2).\n";
    }
}
