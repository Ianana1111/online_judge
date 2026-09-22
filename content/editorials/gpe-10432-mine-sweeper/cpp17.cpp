#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    for(int tc=0;tc<t;++tc) {
        int n;cin >> n;vector<string> board(n),touch(n);
        for(auto &row:board)cin >> row;for(auto &row:touch)cin >> row;
        bool lost=false;
        for(int r=0;r<n;++r)for(int c=0;c<n;++c) if(board[r][c]=='*' && touch[r][c]=='x')lost=true;
        if(tc)cout << '\n';
        for(int r=0;r<n;++r) {
            for(int c=0;c<n;++c) {
                if(lost && board[r][c]=='*') { cout << '*';continue; }
                if(touch[r][c]!='x') { cout << '.';continue; }
                int count=0;
                for(int dr=-1;dr<=1;++dr)for(int dc=-1;dc<=1;++dc) if(dr || dc) {
                    int nr=r+dr,nc=c+dc;
                    if(nr>=0 && nr<n && nc>=0 && nc<n && board[nr][nc]=='*')++count;
                }
                cout << count;
            }
            cout << '\n';
        }
    }
}
