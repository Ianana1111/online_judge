#include <bits/stdc++.h>
using namespace std;
bool possible(const string &y,const string &x,int bound) {
    int m=y.size();vector<int> previous(m+1),current(m+1);iota(previous.begin(),previous.end(),0);
    bool finished=false;
    for(char ch:x) {
        current[0]=previous[0]+1;
        for(int j=1;j<=m;++j) {
            current[j]=min({previous[j]+1,current[j-1]+1,previous[j-1]+(ch!=y[j-1])});
        }
        finished=current[m]<=bound;
        if(finished)for(int j=0;j<=m;++j)current[j]=min(current[j],j);
        previous.swap(current);
    }
    return finished;
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        string y,x;cin >> y >> x;int low=0,high=y.size();
        while(low<high) {
            int middle=(low+high)/2;
            if(possible(y,x,middle))high=middle;else low=middle+1;
        }
        cout << low << '\n';
    }
}
