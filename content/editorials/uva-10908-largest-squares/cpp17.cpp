#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    while (tests--) {
        int rows, cols, queries;
        cin >> rows >> cols >> queries;
        vector<string> grid(rows);
        for (auto& row : grid) cin >> row;
        cout << rows << ' ' << cols << ' ' << queries << '\n';
        while (queries--) {
            int r, c;
            cin >> r >> c;
            int limit = min({r, c, rows - 1 - r, cols - 1 - c});
            int radius = 0;
            for (int next = 1; next <= limit; ++next) {
                bool good = true;
                for (int offset = -next; offset <= next; ++offset) {
                    if (grid[r - next][c + offset] != grid[r][c]
                        || grid[r + next][c + offset] != grid[r][c]
                        || grid[r + offset][c - next] != grid[r][c]
                        || grid[r + offset][c + next] != grid[r][c]) good = false;
                }
                if (!good) break;
                radius = next;
            }
            cout << 2 * radius + 1 << '\n';
        }
    }
}
