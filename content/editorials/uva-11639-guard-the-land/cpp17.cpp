#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int a, b, c, d, e, f, g, h;
        cin >> a >> b >> c >> d >> e >> f >> g >> h;
        int areaA = (c - a) * (d - b), areaB = (g - e) * (h - f);
        int width = max(0, min(c, g) - max(a, e));
        int height = max(0, min(d, h) - max(b, f));
        int strong = width * height;
        int weak = areaA + areaB - 2 * strong;
        int none = 10000 - strong - weak;
        cout << "Night " << tc << ": " << strong << ' ' << weak << ' ' << none << '\n';
    }
}
