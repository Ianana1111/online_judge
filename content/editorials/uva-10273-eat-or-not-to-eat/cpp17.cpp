#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        int n;cin >> n;vector<vector<int>> milk(n);int period=1;
        for(auto &row:milk){int length;cin >> length;row.resize(length);for(int &v:row)cin >> v;period=lcm(period,length);}
        vector<vector<int>> order(period,vector<int>(n));
        for(int phase=0;phase<period;++phase) {
            iota(order[phase].begin(),order[phase].end(),0);
            sort(order[phase].begin(),order[phase].end(),[&](int a,int b) {
                int x=milk[a][phase%milk[a].size()],y=milk[b][phase%milk[b].size()];
                return x!=y?x<y:a<b;
            });
        }
        vector<bool> alive(n,true);vector<int> first(period,0),second(period,1);
        int day=0,last=0,idle=0,remaining=n;
        while(remaining>0 && idle<period) {
            int phase=day%period;int &a=first[phase],&b=second[phase];
            while(a<n && !alive[order[phase][a]])++a;
            b=max(b,a+1);while(b<n && !alive[order[phase][b]])++b;
            int cow=order[phase][a];++day;
            if(b==n || milk[cow][phase%milk[cow].size()]<milk[order[phase][b]][phase%milk[order[phase][b]].size()]) {
                alive[cow]=false;--remaining;last=day;idle=0;
            } else ++idle;
        }
        cout << remaining << ' ' << last << '\n';
    }
}
