#include <algorithm>
#include <iostream>
using namespace std;
const long long MOD=1000000007;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    for(int tc=1;tc<=t;++tc) {
        int count;cin>>count;long long ordered=1,number=1;
        while(count--) {
            long long prime;int exponent;cin>>prime>>exponent;
            long long power=1,lower=0;
            for(int i=0;i<exponent;++i){lower=(lower+power)%MOD;power=power*prime%MOD;}
            long long factor=(lower+(exponent+1)*power)%MOD;
            ordered=ordered*factor%MOD;number=number*power%MOD;
        }
        cout<<"Case "<<tc<<": "<<(ordered+number)%MOD<<'\n';
    }
}
