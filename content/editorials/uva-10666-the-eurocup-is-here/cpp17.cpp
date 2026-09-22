#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--) {
        int n;unsigned long long x;cin>>n>>x;
        if(x==0){cout<<"1 1\n";continue;}
        int optimistic=__builtin_popcountll(x)+1;
        unsigned long long block=x&(~x+1);
        unsigned long long pessimistic=(1ULL<<n)-block+1;
        cout<<optimistic<<' '<<pessimistic<<'\n';
    }
}
