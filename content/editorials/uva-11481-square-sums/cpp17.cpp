#include <iostream>
#include <vector>
using namespace std;
const long long MOD=1000000007;
long long power(long long a,long long e){long long result=1;while(e){if(e&1)result=result*a%MOD;a=a*a%MOD;e>>=1;}return result;}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    vector<long long> factorial(1001,1),inverse(1001,1);
    for(int n=1;n<=1000;++n)factorial[n]=factorial[n-1]*n%MOD;
    inverse[1000]=power(factorial[1000],MOD-2);
    for(int n=1000;n>0;--n)inverse[n-1]=inverse[n]*n%MOD;
    auto choose=[&](int n,int k){return factorial[n]*inverse[k]%MOD*inverse[n-k]%MOD;};
    int t;cin>>t;
    for(int tc=1;tc<=t;++tc) {
        int n,m,k;cin>>n>>m>>k;long long valid=0;
        for(int j=0;j<=m-k;++j) {
            long long term=choose(m-k,j)*factorial[n-k-j]%MOD;
            if(j%2)valid=(valid-term+MOD)%MOD;else valid=(valid+term)%MOD;
        }
        long long answer=choose(m,k)*valid%MOD;
        cout<<"Case "<<tc<<": "<<answer<<'\n';
    }
}
