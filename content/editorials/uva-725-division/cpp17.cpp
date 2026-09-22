#include <bits/stdc++.h>
using namespace std;
bool uniqueDigits(int numerator, int denominator) {
    int used = 0;
    for (int value : {numerator, denominator}) {
        for (int i = 0; i < 5; ++i) {
            int bit = 1 << (value % 10); value /= 10;
            if (used & bit) return false;
            used |= bit;
        }
    }
    return used == (1 << 10) - 1;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; bool first = true;
    while (cin >> n && n) {
        if (!first) cout << '\n'; first = false; bool found = false;
        for (int denominator = 1234; denominator * n <= 98765; ++denominator) {
            int numerator = denominator * n;
            if (!uniqueDigits(numerator, denominator)) continue;
            found = true;
            cout << setfill('0') << setw(5) << numerator << " / " << setw(5) << denominator << " = " << n << '\n';
        }
        if (!found) cout << "There are no solutions for " << n << ".\n";
    }
}
