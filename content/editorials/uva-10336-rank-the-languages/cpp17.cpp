#include <algorithm>
#include <array>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    const vector<pair<int,int>> directions{{1,0},{-1,0},{0,1},{0,-1}};
    for (int tc = 1; tc <= tests; ++tc) {
        int h, w; cin >> h >> w; vector<string> grid(h); for (auto &row : grid) cin >> row;
        array<int,26> components{};
        for (int r = 0; r < h; ++r) for (int c = 0; c < w; ++c) if (grid[r][c] != '.') {
            char language = grid[r][c]; vector<pair<int,int>> pending{{r,c}}; grid[r][c] = '.'; int cells = 0;
            while (!pending.empty()) {
                auto [row, column] = pending.back(); pending.pop_back(); ++cells;
                for (auto [dr, dc] : directions) {
                    int nr = row + dr, nc = column + dc;
                    if (nr >= 0 && nr < h && nc >= 0 && nc < w && grid[nr][nc] == language) {
                        grid[nr][nc] = '.'; pending.push_back({nr,nc});
                    }
                }
            }
            components[language - 'a'] += 1;
        }
        vector<int> order; for (int i = 0; i < 26; ++i) if (components[i]) order.push_back(i);
        sort(order.begin(), order.end(), [&](int a, int b) { if (components[a] != components[b]) return components[a] > components[b]; return a < b; });
        cout << "World #" << tc << '\n';
        for (int language : order) cout << char('a' + language) << ": " << components[language] << '\n';
    }
}
