#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    const int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
    for (int tc = 0; tc < tests; ++tc) {
        int rows, cols, days;
        cin >> rows >> cols >> days;
        vector<string> grid(rows);
        for (auto& row : grid) cin >> row;
        for (int day = 0; day < days; ++day) {
            vector<string> next = grid;
            for (int r = 0; r < rows; ++r) {
                for (int c = 0; c < cols; ++c) {
                    char enemy = grid[r][c] == 'R' ? 'P' : grid[r][c] == 'P' ? 'S' : 'R';
                    for (int d = 0; d < 4; ++d) {
                        int nr = r + dr[d], nc = c + dc[d];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == enemy)
                            next[r][c] = enemy;
                    }
                }
            }
            grid.swap(next);
        }
        if (tc != 0) cout << '\n';
        for (const auto& row : grid) cout << row << '\n';
    }
}
