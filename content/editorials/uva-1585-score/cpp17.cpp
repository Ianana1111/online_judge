#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string result; cin >> result; int streak = 0, total = 0;
        for (char ch : result) {
            if (ch == 'O') { ++streak; total += streak; }
            else streak = 0;
        }
        cout << total << '\n';
    }
}
