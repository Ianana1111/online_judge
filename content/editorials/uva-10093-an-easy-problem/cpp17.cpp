#include <bits/stdc++.h>
using namespace std;
int digitValue(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'A' && c <= 'Z') return c - 'A' + 10;
    return c - 'a' + 36;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string text;
    while (cin >> text) {
        long long sum = 0; int maximum = 0;
        for (char c : text) {
            if (c == '+' || c == '-') continue;
            int value = digitValue(c); sum += value; maximum = max(maximum, value);
        }
        int answer = -1;
        for (int base = max(2, maximum + 1); base <= 62; ++base)
            if (sum % (base - 1) == 0) { answer = base; break; }
        if (answer == -1) cout << "such number is impossible!\n";
        else cout << answer << '\n';
    }
}
