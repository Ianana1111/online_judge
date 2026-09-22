#include <bits/stdc++.h>
using namespace std;
int main(){
    vector<string> grid(10);for(auto &row:grid)if(!(cin>>row))return 0;
    int start=-1,goal=-1;
    for(int r=0;r<10;++r)for(int c=0;c<10;++c){if(grid[r][c]=='S')start=10*r+c;if(grid[r][c]=='G')goal=10*r+c;}
    vector<int> parent(100,-1);queue<int> q;q.push(start);parent[start]=start;
    int dr[]={-1,0,1,0},dc[]={0,1,0,-1};
    while(!q.empty()){
        int u=q.front();q.pop();
        for(int d=0;d<4;++d){
            int r=u/10+dr[d],c=u%10+dc[d];
            if(r<0||r>=10||c<0||c>=10||grid[r][c]=='#')continue;
            int v=10*r+c;if(parent[v]!=-1)continue;parent[v]=u;q.push(v);
        }
    }
    if(parent[goal]==-1){cout<<"No solution\n\n";return 0;}
    for(int at=goal;;at=parent[at]){grid[at/10][at%10]='+';if(at==start)break;}
    for(auto &row:grid)cout<<row<<'\n';cout<<'\n';
}
