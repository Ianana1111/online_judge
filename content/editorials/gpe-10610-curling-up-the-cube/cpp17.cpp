#include <array>
#include <iostream>
#include <queue>
#include <set>
#include <utility>
using namespace std;
using Vec=array<int,3>;
using Frame=array<Vec,3>;
Vec negative(Vec a){for(int &x:a)x=-x;return a;}
Frame turn(Frame f,int direction) {
    auto [u,v,n]=f;
    if(direction==0)return {negative(n),v,u};
    if(direction==1)return {n,v,negative(u)};
    if(direction==2)return {u,negative(n),v};
    return {u,n,negative(v)};
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    for(int tc=0;tc<t;++tc) {
        int board[6][6],sr=-1,sc=-1;
        for(int r=0;r<6;++r)for(int c=0;c<6;++c){cin >> board[r][c];if(board[r][c]){sr=r;sc=c;}}
        bool seen[6][6]={},valid=true;Frame frame[6][6];queue<pair<int,int>> q;
        frame[sr][sc]=Frame{Vec{1,0,0},Vec{0,1,0},Vec{0,0,1}};
        seen[sr][sc]=true;q.push({sr,sc});set<Vec> normals;
        int dr[4]={0,0,1,-1},dc[4]={1,-1,0,0},visited=0;
        while(!q.empty()) {
            auto [r,c]=q.front();q.pop();++visited;normals.insert(frame[r][c][2]);
            for(int d=0;d<4;++d) {
                int nr=r+dr[d],nc=c+dc[d];
                if(nr<0 || nr>=6 || nc<0 || nc>=6 || !board[nr][nc])continue;
                Frame next=turn(frame[r][c],d);
                if(seen[nr][nc]){if(frame[nr][nc]!=next)valid=false;}
                else {seen[nr][nc]=true;frame[nr][nc]=next;q.push({nr,nc});}
            }
        }
        if(tc)cout << '\n';
        cout << (valid && visited==6 && normals.size()==6 ? "correct" : "incorrect") << '\n';
    }
}
