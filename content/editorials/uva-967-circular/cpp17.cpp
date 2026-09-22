#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    const int limit=1000000;vector<bool> prime(limit,true);prime[0]=prime[1]=false;
    for(int p=2;p*p<limit;++p)if(prime[p])for(int multiple=p*p;multiple<limit;multiple+=p)prime[multiple]=false;
    vector<int> prefix(limit);
    for(int value=100;value<limit;++value) {
        bool good=prime[value];int power=1,length=1;
        for(int rest=value;rest>=10;rest/=10){power*=10;++length;}
        int rotated=value;
        for(int shift=1;good&&shift<length;++shift) {
            rotated=(rotated%power)*10+rotated/power;
            if(!prime[rotated])good=false;
        }
        prefix[value]=prefix[value-1]+good;
    }
    int left,right;
    while(cin>>left&&left!=-1) {
        cin>>right;int count=prefix[right]-prefix[left-1];
        if(count==0)cout<<"No Circular Primes.\n";
        else if(count==1)cout<<"1 Circular Prime.\n";
        else cout<<count<<" Circular Primes.\n";
    }
}
