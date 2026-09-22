#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const vector<pair<int,int>> directions{{-1,0},{1,0},{0,-1},{0,1}};
    int width,height,tc = 0;
    while (cin >> width >> height && (width || height)) {
        vector<string> grid(height); for (auto &row : grid) cin >> row;
        vector<vector<bool>> dieSeen(height,vector<bool>(width,false)),pipSeen = dieSeen; vector<int> answer;
        auto inside = [&](int r,int c) { return 0 <= r && r < height && 0 <= c && c < width; };
        for (int startRow = 0; startRow < height; ++startRow) for (int startCol = 0; startCol < width; ++startCol) {
            if (grid[startRow][startCol] == '.' || dieSeen[startRow][startCol]) continue;
            vector<pair<int,int>> cells; queue<pair<int,int>> pending; pending.push({startRow,startCol}); dieSeen[startRow][startCol] = true;
            while (!pending.empty()) {
                auto [r,c] = pending.front(); pending.pop(); cells.push_back({r,c});
                for (auto [dr,dc] : directions) { int rr = r+dr,cc = c+dc; if (inside(rr,cc) && grid[rr][cc] != '.' && !dieSeen[rr][cc]) { dieSeen[rr][cc] = true; pending.push({rr,cc}); } }
            }
            int dots = 0;
            for (auto [r,c] : cells) if (grid[r][c] == 'X' && !pipSeen[r][c]) {
                ++dots; queue<pair<int,int>> pixels; pixels.push({r,c}); pipSeen[r][c] = true;
                while (!pixels.empty()) {
                    auto [x,y] = pixels.front(); pixels.pop();
                    for (auto [dr,dc] : directions) { int xx = x+dr,yy = y+dc; if (inside(xx,yy) && grid[xx][yy] == 'X' && !pipSeen[xx][yy]) { pipSeen[xx][yy] = true; pixels.push({xx,yy}); } }
                }
            }
            answer.push_back(dots);
        }
        sort(answer.begin(),answer.end()); cout << "Throw " << ++tc << '\n';
        for (int i = 0; i < (int)answer.size(); ++i) { if (i) cout << ' '; cout << answer[i]; }
        cout << "\n\n";
    }
}
