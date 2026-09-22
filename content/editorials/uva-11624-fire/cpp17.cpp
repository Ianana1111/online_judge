#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    const int dy[] = {1,-1,0,0}, dx[] = {0,0,1,-1};
    while (tests--) {
        int rows, cols; cin >> rows >> cols;
        vector<string> grid(rows); vector<int> fire(rows * cols, INT_MAX), distance(rows * cols, -1);
        queue<int> q; int start = -1;
        for (int y = 0; y < rows; ++y) {
            cin >> grid[y];
            for (int x = 0; x < cols; ++x) {
                int id = y * cols + x;
                if (grid[y][x] == 'F') { fire[id] = 0; q.push(id); }
                if (grid[y][x] == 'J') start = id;
            }
        }
        while (!q.empty()) {
            int id = q.front(); q.pop();
            for (int d = 0; d < 4; ++d) {
                int y = id / cols + dy[d], x = id % cols + dx[d];
                if (y < 0 || y >= rows || x < 0 || x >= cols || grid[y][x] == '#') continue;
                int next = y * cols + x;
                if (fire[next] != INT_MAX) continue;
                fire[next] = fire[id] + 1; q.push(next);
            }
        }
        q.push(start); distance[start] = 0; int answer = -1;
        while (!q.empty() && answer < 0) {
            int id = q.front(); q.pop(); int y = id / cols, x = id % cols;
            if (y == 0 || y == rows - 1 || x == 0 || x == cols - 1) { answer = distance[id] + 1; break; }
            for (int d = 0; d < 4; ++d) {
                int ny = y + dy[d], nx = x + dx[d], next = ny * cols + nx;
                if (grid[ny][nx] == '#' || distance[next] >= 0) continue;
                int arrival = distance[id] + 1;
                if (arrival >= fire[next]) continue;
                distance[next] = arrival; q.push(next);
            }
        }
        if (answer < 0) cout << "IMPOSSIBLE\n"; else cout << answer << '\n';
    }
}
