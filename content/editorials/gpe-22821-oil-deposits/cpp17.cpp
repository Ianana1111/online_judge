#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int rows, columns;
    while (cin >> rows >> columns && rows) {
        vector<string> grid(rows); for (auto &row : grid) cin >> row;
        int answer = 0;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < columns; ++c) if (grid[r][c] == '@') {
            ++answer; vector<pair<int,int>> pending{{r,c}}; grid[r][c] = '*';
            while (!pending.empty()) {
                auto [row,column] = pending.back(); pending.pop_back();
                for (int dr = -1; dr <= 1; ++dr) for (int dc = -1; dc <= 1; ++dc) {
                    if (dr == 0 && dc == 0) continue;
                    int nr = row + dr, nc = column + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && grid[nr][nc] == '@') {
                        grid[nr][nc] = '*'; pending.push_back({nr,nc});
                    }
                }
            }
        }
        cout << answer << '\n';
    }
}
