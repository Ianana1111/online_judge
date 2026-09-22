#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int r,c;const int INF=1000000000;
    while(cin >> r >> c) {
        vector<string> grid(r);for(string &row:grid)cin >> row;string word;cin >> word;
        int selections=word.size()+1;word.push_back('*');
        string targets;for(char ch:word)if(targets.empty() || targets.back()!=ch)targets.push_back(ch);
        int size=r*c;vector<vector<int>> next(size);int dr[4]={1,-1,0,0},dc[4]={0,0,1,-1};
        for(int row=0;row<r;++row)for(int col=0;col<c;++col)for(int d=0;d<4;++d) {
            int nr=row+dr[d],nc=col+dc[d];
            while(nr>=0 && nr<r && nc>=0 && nc<c && grid[nr][nc]==grid[row][col]){nr+=dr[d];nc+=dc[d];}
            if(nr>=0 && nr<r && nc>=0 && nc<c)next[row*c+col].push_back(nr*c+nc);
        }
        vector<int> cost(size,INF);cost[0]=0;
        for(char target:targets) {
            vector<int> distance=cost;
            priority_queue<pair<int,int>,vector<pair<int,int>>,greater<pair<int,int>>> heap;
            for(int cell=0;cell<size;++cell)if(distance[cell]<INF)heap.push({distance[cell],cell});
            while(!heap.empty()) {
                auto [d,cell]=heap.top();heap.pop();if(d!=distance[cell])continue;
                for(int to:next[cell])if(d+1<distance[to]){distance[to]=d+1;heap.push({d+1,to});}
            }
            for(int cell=0;cell<size;++cell)cost[cell]=(grid[cell/c][cell%c]==target?distance[cell]:INF);
        }
        cout << *min_element(cost.begin(),cost.end())+selections << '\n';
    }
}
