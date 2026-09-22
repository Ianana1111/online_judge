#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int hour, minute; char colon;
    while (cin >> hour >> colon >> minute && (hour || minute)) {
        int twiceAngle = abs(60 * (hour % 12) + minute - 12 * minute);
        twiceAngle = min(twiceAngle, 720 - twiceAngle);
        cout << fixed << setprecision(3) << twiceAngle / 2.0 << '\n';
    }
}
