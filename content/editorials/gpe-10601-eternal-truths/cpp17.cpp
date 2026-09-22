#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        int r,c;cin >> r >> c;vector<string> board(r);int sr=-1,sc=-1;
        for(int i=0;i<r;++i){cin >> board[i];for(int j=0;j<c;++j)if(board[i][j]=='S'){sr=i;sc=j;}}
        vector<bool> seen(r*c*3);queue<array<int,4>> q;q.push({sr,sc,0,0});seen[(sr*c+sc)*3]=true;
        int answer=-1,dr[4]={1,-1,0,0},dc[4]={0,0,1,-1};
        while(!q.empty()) {
            auto [row,col,phase,moves]=q.front();q.pop();
            if(board[row][col]=='E'){answer=moves;break;}
            int length=phase+1,nextPhase=(phase+1)%3;
            for(int direction=0;direction<4;++direction) {
                int nr=row,nc=col;bool valid=true;
                for(int step=1;step<=length;++step) {
                    nr+=dr[direction];nc+=dc[direction];
                    if(nr<0 || nr>=r || nc<0 || nc>=c || board[nr][nc]=='#'){valid=false;break;}
                }
                if(!valid)continue;
                int key=(nr*c+nc)*3+nextPhase;
                if(!seen[key]){seen[key]=true;q.push({nr,nc,nextPhase,moves+1});}
            }
        }
        if(answer<0)cout << "NO\n";else cout << answer << '\n';
    }
}
