#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int rows, cols, field = 0;
    while (cin >> rows >> cols && (rows != 0 || cols != 0)) {
        vector<string> grid(rows);
        for (auto& row : grid) cin >> row;
        if (field > 0) cout << '\n';
        cout << "Field #" << ++field << ":\n";
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) {
                if (grid[r][c] == '*') {
                    cout << '*';
                    continue;
                }
                int count = 0;
                for (int dr = -1; dr <= 1; ++dr) {
                    for (int dc = -1; dc <= 1; ++dc) {
                        if (dr == 0 && dc == 0) continue;
                        int nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                            && grid[nr][nc] == '*') ++count;
                    }
                }
                cout << count;
            }
            cout << '\n';
        }
    }
}
