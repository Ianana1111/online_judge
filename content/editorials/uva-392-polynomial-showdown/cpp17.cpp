#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    array<int, 9> coefficient;
    while (cin >> coefficient[0]) {
        for (int i = 1; i < 9; ++i) cin >> coefficient[i];
        bool first = true;
        for (int i = 0; i < 9; ++i) {
            int c = coefficient[i], degree = 8 - i;
            if (c == 0) continue;
            if (first) { if (c < 0) cout << '-'; }
            else cout << (c < 0 ? " - " : " + ");
            int magnitude = abs(c);
            if (degree == 0 || magnitude != 1) cout << magnitude;
            if (degree > 0) { cout << 'x'; if (degree > 1) cout << '^' << degree; }
            first = false;
        }
        if (first) cout << 0;
        cout << '\n';
    }
}
