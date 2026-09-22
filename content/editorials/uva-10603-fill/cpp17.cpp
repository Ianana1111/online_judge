#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    while (t--) {
        array<int,3> cap; int target; cin >> cap[0] >> cap[1] >> cap[2] >> target;
        const int INF=1000000000;
        vector<vector<int>> distance(cap[0]+1,vector<int>(cap[1]+1,INF));
        vector<int> best(201,INF);
        priority_queue<tuple<int,int,int>,vector<tuple<int,int,int>>,greater<tuple<int,int,int>>> queue;
        distance[0][0]=0; queue.emplace(0,0,0);
        while (!queue.empty()) {
            auto [cost,a,b]=queue.top();queue.pop();
            if (cost!=distance[a][b]) continue;
            array<int,3> amountNow={a,b,cap[2]-a-b};
            for (int volume:amountNow) best[volume]=min(best[volume],cost);
            for (int from=0;from<3;++from) for (int to=0;to<3;++to) if (from!=to) {
                int amount=min(amountNow[from],cap[to]-amountNow[to]);
                if (amount==0) continue;
                auto next=amountNow;next[from]-=amount;next[to]+=amount;
                int nextCost=cost+amount;
                if (nextCost<distance[next[0]][next[1]]) {
                    distance[next[0]][next[1]]=nextCost;queue.emplace(nextCost,next[0],next[1]);
                }
            }
        }
        for (int volume=target;volume>=0;--volume) if (best[volume]!=INF) {
            cout << best[volume] << ' ' << volume << '\n';break;
        }
    }
}
