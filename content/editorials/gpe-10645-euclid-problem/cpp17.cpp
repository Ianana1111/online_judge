#include <bits/stdc++.h>
using namespace std;
long long floorDiv(long long a, long long b) {
    long long q = a / b, r = a % b;
    return q - (r < 0);
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long a, b;
    while (cin >> a >> b) {
        long long r0 = a, r1 = b, x0 = 1, x1 = 0, y0 = 0, y1 = 1;
        while (r1) {
            long long q = r0 / r1;
            long long r2 = r0 - q * r1, x2 = x0 - q * x1, y2 = y0 - q * y1;
            r0 = r1; r1 = r2; x0 = x1; x1 = x2; y0 = y1; y1 = y2;
        }
        long long stepX = b / r0, stepY = a / r0;
        vector<long long> shifts{0};
        for (long long k : {floorDiv(-x0, stepX), floorDiv(y0, stepY)}) {
            shifts.push_back(k); shifts.push_back(k + 1);
        }
        auto key = [](long long x, long long y) { return make_tuple(llabs(x) + llabs(y), x > y, x, y); };
        long long bestX = x0, bestY = y0;
        for (long long k : shifts) {
            long long x = x0 + k * stepX, y = y0 - k * stepY;
            if (key(x, y) < key(bestX, bestY)) { bestX = x; bestY = y; }
        }
        cout << bestX << ' ' << bestY << ' ' << r0 << '\n';
    }
}
