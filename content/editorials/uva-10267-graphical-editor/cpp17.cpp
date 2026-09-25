#include <algorithm>
#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<string> grid; int width = 0, height = 0; string line;
    while (getline(cin,line)) {
        istringstream input(line); char op; if (!(input >> op)) continue;
        if (op == 'X') break;
        if (op == 'I') { input >> width >> height; grid.assign(height,string(width,'O')); }
        else if (op == 'C') { for (auto &row : grid) fill(row.begin(),row.end(),'O'); }
        else if (op == 'S') { string name; input >> name; cout << name << '\n'; for (const auto &row : grid) cout << row << '\n'; }
        else if (op == 'L') { int x,y; char color; input >> x >> y >> color; grid[y - 1][x - 1] = color; }
        else if (op == 'V') {
            int x,y1,y2; char color; input >> x >> y1 >> y2 >> color; if (y1 > y2) swap(y1,y2);
            for (int y = y1; y <= y2; ++y) grid[y - 1][x - 1] = color;
        } else if (op == 'H') {
            int x1,x2,y; char color; input >> x1 >> x2 >> y >> color; if (x1 > x2) swap(x1,x2);
            for (int x = x1; x <= x2; ++x) grid[y - 1][x - 1] = color;
        } else if (op == 'K') {
            int x1,y1,x2,y2; char color; input >> x1 >> y1 >> x2 >> y2 >> color;
            for (int y = y1; y <= y2; ++y) for (int x = x1; x <= x2; ++x) grid[y - 1][x - 1] = color;
        } else if (op == 'F') {
            int x,y; char color; input >> x >> y >> color; --x; --y; char old = grid[y][x];
            if (old == color) continue;
            queue<pair<int,int>> q; q.push({x,y}); grid[y][x] = color;
            while (!q.empty()) {
                auto [cx,cy] = q.front(); q.pop();
                const int dx[] = {1,-1,0,0}, dy[] = {0,0,1,-1};
                for (int d = 0; d < 4; ++d) {
                    int nx = cx + dx[d], ny = cy + dy[d];
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height || grid[ny][nx] != old) continue;
                    grid[ny][nx] = color; q.push({nx,ny});
                }
            }
        }
    }
}
