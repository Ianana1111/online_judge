#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int levels, rows, cols;
    while (cin >> levels >> rows >> cols && levels) {
        vector<string> grid(levels * rows);
        int start = -1, finish = -1;
        for (int z = 0; z < levels; ++z) for (int y = 0; y < rows; ++y) {
            cin >> grid[z * rows + y];
            for (int x = 0; x < cols; ++x) {
                int id = (z * rows + y) * cols + x;
                if (grid[z * rows + y][x] == 'S') start = id;
                if (grid[z * rows + y][x] == 'E') finish = id;
            }
        }
        vector<int> distance(levels * rows * cols, -1);
        queue<int> q; q.push(start); distance[start] = 0;
        const int dz[] = {1,-1,0,0,0,0}, dy[] = {0,0,1,-1,0,0}, dx[] = {0,0,0,0,1,-1};
        while (!q.empty()) {
            int id = q.front(); q.pop();
            int x = id % cols, y = id / cols % rows, z = id / (cols * rows);
            for (int d = 0; d < 6; ++d) {
                int nz = z + dz[d], ny = y + dy[d], nx = x + dx[d];
                if (nz < 0 || nz >= levels || ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue;
                int next = (nz * rows + ny) * cols + nx;
                if (grid[nz * rows + ny][nx] == '#' || distance[next] != -1) continue;
                distance[next] = distance[id] + 1; q.push(next);
            }
        }
        if (distance[finish] < 0) cout << "Trapped!\n";
        else cout << "Escaped in " << distance[finish] << " minute(s).\n";
    }
}
