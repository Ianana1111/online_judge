#include <algorithm>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n;
    while (cin >> n && n != 0) {
        long long low = 1, high = 44722;
        while (low < high) {
            long long mid = (low + high) / 2;
            if (mid * mid >= n) high = mid;
            else low = mid + 1;
        }
        long long side = low, distance = side * side - n;
        long long x, y;
        if (distance < side) { x = side; y = distance + 1; }
        else { x = 2 * side - 1 - distance; y = side; }
        if (side % 2 == 1) swap(x, y);
        cout << x << ' ' << y << '\n';
    }
}
