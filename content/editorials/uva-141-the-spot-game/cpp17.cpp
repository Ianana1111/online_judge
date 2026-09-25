#include <algorithm>
#include <iostream>
#include <set>
#include <string>
#include <utility>
using namespace std;
string canonical(string board,int n) {
    string best=board;
    for(int turn=0;turn<4;++turn) {
        best=min(best,board);string next(n*n,'0');
        for(int r=0;r<n;++r)for(int c=0;c<n;++c)next[c*n+n-1-r]=board[r*n+c];
        board=move(next);
    }
    return best;
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while(cin>>n&&n) {
        string board(n*n,'0');set<string> seen;int winner=0,losingMove=0;
        for(int step=1;step<=2*n;++step) {
            int r,c;char op;cin>>r>>c>>op;board[(r-1)*n+c-1]=(op=='+')?'1':'0';
            if(winner)continue;
            string key=canonical(board,n);
            if(seen.count(key)){winner=step%2?2:1;losingMove=step;}
            seen.insert(key);
        }
        if(winner)cout<<"Player "<<winner<<" wins on move "<<losingMove<<'\n';
        else cout<<"Draw\n";
    }
}
