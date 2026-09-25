#include <algorithm>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int h, u, d, f;
    while (cin >> h >> u >> d >> f && h) {
        int height = 0, climb = u * 100, fatigue = u * f;
        for (int day = 1; ; ++day) {
            height += max(0, climb);
            if (height > h * 100) { cout << "success on day " << day << '\n'; break; }
            height -= d * 100;
            if (height < 0) { cout << "failure on day " << day << '\n'; break; }
            climb -= fatigue;
        }
    }
}
