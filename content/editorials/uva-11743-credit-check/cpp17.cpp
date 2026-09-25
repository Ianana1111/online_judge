#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string digits, part;
        for (int group = 0; group < 4; ++group) { cin >> part; digits += part; }
        int sum = 0;
        for (int i = 0; i < 16; ++i) {
            int value = digits[i] - '0';
            if (i % 2 == 0) { value *= 2; if (value > 9) value -= 9; }
            sum += value;
        }
        cout << (sum % 10 == 0 ? "Valid" : "Invalid") << '\n';
    }
}
