#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int queries;
    while (cin >> queries && queries != 0) {
        int centerX, centerY; cin >> centerX >> centerY;
        while (queries--) {
            int x, y; cin >> x >> y;
            if (x == centerX || y == centerY) cout << "divisa\n";
            else cout << (y > centerY ? 'N' : 'S') << (x > centerX ? 'E' : 'O') << '\n';
        }
    }
}
