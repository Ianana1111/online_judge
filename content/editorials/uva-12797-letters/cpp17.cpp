#include <algorithm>
#include <climits>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while(cin>>n) {
        vector<string> grid(n);for(string& row:grid)cin>>row;
        vector<int> letter(n*n),upper(n*n);
        for(int r=0;r<n;++r)for(int c=0;c<n;++c){char ch=grid[r][c];int at=r*n+c;upper[at]=(ch>='A'&&ch<='J');letter[at]=upper[at]?ch-'A':ch-'a';}
        int answer=INT_MAX;vector<int> distance(n*n),queue(n*n);
        for(int mask=0;mask<(1<<10);++mask) {
            auto allowed=[&](int at){return ((mask>>letter[at])&1)==upper[at];};
            if(!allowed(0)||!allowed(n*n-1))continue;
            fill(distance.begin(),distance.end(),-1);int front=0,back=0;
            queue[back++]=0;distance[0]=1;
            while(front<back) {
                int at=queue[front++];
                if(at==n*n-1){answer=min(answer,distance[at]);break;}
                int r=at/n,c=at%n;
                const int dr[4]={-1,1,0,0},dc[4]={0,0,-1,1};
                for(int d=0;d<4;++d) {
                    int rr=r+dr[d],cc=c+dc[d];if(rr<0||rr>=n||cc<0||cc>=n)continue;
                    int next=rr*n+cc;
                    if(distance[next]!=-1||!allowed(next))continue;
                    distance[next]=distance[at]+1;queue[back++]=next;
                }
            }
            if(answer==2*n-1)break;
        }
        cout<<(answer==INT_MAX?-1:answer)<<'\n';
    }
}
