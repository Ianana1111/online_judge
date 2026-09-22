#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    const int bound=1000000;const long long limit=999999999999LL;
    vector<bool> prime(bound+1,true);prime[0]=prime[1]=false;
    for(int p=2;p*p<=bound;++p)if(prime[p])for(int multiple=p*p;multiple<=bound;multiple+=p)prime[multiple]=false;
    vector<long long> powers;
    for(int p=2;p<=bound;++p)if(prime[p]) {
        long long value=1LL*p*p;
        while(value<=limit) {
            powers.push_back(value);
            if(value>limit/p)break;
            value*=p;
        }
    }
    sort(powers.begin(),powers.end());
    int t;cin >> t;
    while(t--) {
        long long low,high;cin >> low >> high;
        cout << upper_bound(powers.begin(),powers.end(),high)-lower_bound(powers.begin(),powers.end(),low) << '\n';
    }
}
