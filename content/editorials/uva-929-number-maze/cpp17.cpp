#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while (t--) {
        int n,m;cin >> n >> m;int size=n*m;
        vector<int> weight(size),distance(size,INT_MAX);
        for (int &v:weight) cin >> v;
        priority_queue<pair<int,int>,vector<pair<int,int>>,greater<pair<int,int>>> queue;
        distance[0]=weight[0];queue.emplace(distance[0],0);
        int dr[4]={1,0,-1,0},dc[4]={0,1,0,-1};
        while (!queue.empty()) {
            auto [cost,node]=queue.top();queue.pop();
            if (distance[node]!=cost) continue;
            if (node==size-1) break;
            int row=node/m,col=node%m;
            for (int direction=0;direction<4;++direction) {
                int r=row+dr[direction],c=col+dc[direction];
                if (r<0 || r>=n || c<0 || c>=m) continue;
                int next=r*m+c,candidate=cost+weight[next];
                if (candidate<distance[next]) { distance[next]=candidate;queue.emplace(candidate,next); }
            }
        }
        cout << distance.back() << '\n';
    }
}
