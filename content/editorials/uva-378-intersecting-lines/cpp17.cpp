#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

long long cross(long long ax, long long ay, long long bx, long long by) {
    return ax * by - ay * bx;
}

string formatRatio(long long numerator, long long denominator) {
    if (denominator < 0) { numerator = -numerator; denominator = -denominator; }
    long long rounded = (2 * llabs(numerator) * 100 + denominator) / (2 * denominator);
    ostringstream out;
    if (numerator < 0 && rounded) out << '-';
    out << rounded / 100 << '.' << setw(2) << setfill('0') << rounded % 100;
    return out.str();
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int cases;
    cin >> cases;
    cout << "INTERSECTING LINES OUTPUT\n";
    while (cases--) {
        long long x1, y1, x2, y2, x3, y3, x4, y4;
        cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3 >> x4 >> y4;
        long long ux = x2 - x1, uy = y2 - y1;
        long long vx = x4 - x3, vy = y4 - y3;
        long long dx = x3 - x1, dy = y3 - y1;
        long long denominator = cross(ux, uy, vx, vy);
        if (!denominator) {
            cout << (cross(dx, dy, ux, uy) == 0 ? "LINE" : "NONE") << '\n';
        } else {
            long long fraction = cross(dx, dy, vx, vy);
            cout << "POINT " << formatRatio(x1 * denominator + ux * fraction, denominator)
                 << ' ' << formatRatio(y1 * denominator + uy * fraction, denominator) << '\n';
        }
    }
    cout << "END OF OUTPUT\n";
}
