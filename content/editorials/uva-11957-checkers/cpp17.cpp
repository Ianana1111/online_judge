#include <bits/stdc++.h>
using namespace std;
const int MOD=1000007;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    for (int tc=1;tc<=t;++tc) {
        int n; cin >> n;
        vector<string> board(n); vector<vector<int>> ways(n,vector<int>(n));
        for (int row=0;row<n;++row) {
            cin >> board[row];
            for (int col=0;col<n;++col) if (board[row][col]=='W') ways[row][col]=1;
        }
        for (int row=n-1;row>0;--row) for (int col=0;col<n;++col) if (ways[row][col]) {
            for (int direction : {-1,1}) {
                int nextRow=row-1,nextCol=col+direction;
                if (nextCol<0 || nextCol>=n) continue;
                if (board[nextRow][nextCol]=='B') { --nextRow; nextCol+=direction; }
                if (nextRow<0 || nextCol<0 || nextCol>=n || board[nextRow][nextCol]=='B') continue;
                ways[nextRow][nextCol]=(ways[nextRow][nextCol]+ways[row][col])%MOD;
            }
        }
        int answer=0;
        for (int col=0;col<n;++col) answer=(answer+ways[0][col])%MOD;
        cout << "Case " << tc << ": " << answer << '\n';
    }
}
