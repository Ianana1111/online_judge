#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--) {
        int n;cin>>n;vector<int> seen(100001,0);int epoch=1,answer=0;
        for(int i=0;i<n;++i) {
            int value;cin>>value;
            if(seen[value]==epoch){++answer;++epoch;}
            seen[value]=epoch;
        }
        cout<<answer<<'\n';
    }
}
