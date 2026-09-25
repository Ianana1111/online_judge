#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 99999; vector<pair<int,int>> coordinate(limit + 1);
    int label = 1, x = 0, y = 0;
    auto step = [&](int dx, int dy) {
        x += dx; y += dy; if (++label <= limit) coordinate[label] = {x,y};
    };
    const int dx[6]{-1,-1,0,1,1,0}, dy[6]{1,0,-1,-1,0,1};
    for (int ring = 1; label < limit; ++ring) {
        step(0,1);
        for (int direction = 0; direction < 6; ++direction) {
            int count = direction == 0 ? ring - 1 : ring;
            for (int j = 0; j < count; ++j) step(dx[direction],dy[direction]);
        }
    }
    int n;
    while (cin >> n) cout << coordinate[n].first << ' ' << coordinate[n].second << '\n';
}
