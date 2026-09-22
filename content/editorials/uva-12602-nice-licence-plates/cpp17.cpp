#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string plate; cin >> plate; int letters = 0;
        for (int i = 0; i < 3; ++i) letters = letters * 26 + plate[i] - 'A';
        int digits = stoi(plate.substr(4));
        cout << (abs(letters - digits) <= 100 ? "nice" : "not nice") << '\n';
    }
}
