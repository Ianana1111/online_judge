#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--) {
        int m,n;cin>>m>>n;vector<int> a(m),frequency(m+1);
        for(int& x:a)cin>>x;
        long long excess=0;
        for(int j=0;j<n;++j){int b;cin>>b;++frequency[b];excess+=b;}
        sort(a.rbegin(),a.rend());
        long long prefix=0,answer=excess;int positive=n-frequency[0];
        for(int k=1;k<=m;++k) {
            excess-=positive;positive-=frequency[k];prefix+=a[k-1];
            answer=max(answer,prefix+excess);
        }
        cout<<answer<<'\n';
    }
}
