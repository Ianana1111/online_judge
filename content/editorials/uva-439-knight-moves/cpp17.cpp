#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int dx[] = {1,1,-1,-1,2,2,-2,-2}, dy[] = {2,-2,2,-2,1,-1,1,-1};
    string from, to;
    while (cin >> from >> to) {
        int sx = from[0] - 'a', sy = from[1] - '1', tx = to[0] - 'a', ty = to[1] - '1';
        int distance[8][8]; for (auto &row : distance) fill(begin(row),end(row),-1);
        queue<pair<int,int>> q; q.push({sx,sy}); distance[sx][sy] = 0;
        while (!q.empty()) {
            auto [x,y] = q.front(); q.pop();
            for (int d = 0; d < 8; ++d) {
                int nx = x + dx[d], ny = y + dy[d];
                if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8 || distance[nx][ny] >= 0) continue;
                distance[nx][ny] = distance[x][y] + 1; q.push({nx,ny});
            }
        }
        cout << "To get from " << from << " to " << to << " takes " << distance[tx][ty] << " knight moves.\n";
    }
}
