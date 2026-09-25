#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int rows, cols;
    while (cin >> rows >> cols) {
        vector<string> grid(rows); for (string &row : grid) cin >> row;
        int sy, sx; cin >> sy >> sx; char land = grid[sy][sx];
        vector<vector<bool>> seen(rows, vector<bool>(cols));
        auto flood = [&](int y, int x) {
            queue<pair<int,int>> q; q.push({y,x}); seen[y][x] = true; int size = 0;
            while (!q.empty()) {
                auto [r,c] = q.front(); q.pop(); ++size;
                const int dy[] = {1,-1,0,0}, dx[] = {0,0,1,-1};
                for (int d = 0; d < 4; ++d) {
                    int nr = r + dy[d], nc = (c + dx[d] + cols) % cols;
                    if (nr < 0 || nr >= rows || seen[nr][nc] || grid[nr][nc] != land) continue;
                    seen[nr][nc] = true; q.push({nr,nc});
                }
            }
            return size;
        };
        flood(sy,sx); int answer = 0;
        for (int y = 0; y < rows; ++y) for (int x = 0; x < cols; ++x)
            if (!seen[y][x] && grid[y][x] == land) answer = max(answer, flood(y,x));
        cout << answer << '\n';
    }
}
