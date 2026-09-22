#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int start, a, b, c;
    while (cin >> start >> a >> b >> c) {
        if (start == 0 && a == 0 && b == 0 && c == 0) break;
        int clockwiseFirst = (start - a + 40) % 40;
        int counterclockwise = (b - a + 40) % 40;
        int clockwiseLast = (b - c + 40) % 40;
        int ticks = 120 + clockwiseFirst + counterclockwise + clockwiseLast;
        cout << ticks * 9 << '\n';
    }
}
