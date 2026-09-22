#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--) {
        long long n,m;cin>>n>>m;
        long long excess=m-(n-1),low=1,high=n;
        while(low<high) {
            long long mid=(low+high)/2;
            if((mid-1)*(mid-2)/2>=excess)high=mid;
            else low=mid+1;
        }
        cout<<n-low<<'\n';
    }
}
