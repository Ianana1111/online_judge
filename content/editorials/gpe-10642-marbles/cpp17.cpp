#include <bits/stdc++.h>
using namespace std;
const long long MOD=1000000007;
long long power(long long a,long long e){long long r=1;while(e){if(e&1)r=r*a%MOD;a=a*a%MOD;e>>=1;}return r;}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    vector<long long> fact(100001,1),inv(100001,1);
    for(int i=1;i<=100000;++i)fact[i]=fact[i-1]*i%MOD;
    inv[100000]=power(fact[100000],MOD-2);
    for(int i=100000;i>0;--i)inv[i-1]=inv[i]*i%MOD;
    auto choose=[&](int n,int k){return fact[n]*inv[k]%MOD*inv[n-k]%MOD;};
    int t;cin>>t;
    vector<int> sizes(t);vector<long long> answers(t);
    map<pair<int,int>,vector<int>> groups;
    for(int tc=0;tc<t;++tc){
        int n,k,x;cin>>n>>k>>x;sizes[tc]=n;long long &answer=answers[tc];
        if(n>=k*x){
            if(k==1)answer=1;
            else if(x==1){
                for(int j=0;j<=k;++j){
                    long long term=choose(k,j)*power(k-j,n)%MOD;
                    answer=(answer+(j%2?MOD-term:term))%MOD;
                }
            }else groups[{k,x}].push_back(tc);
        }
    }
    for(const auto &[key,queries]:groups){
                auto [k,x]=key;int n=0;
                for(int query:queries)n=max(n,sizes[query]);
                vector<long long> binomial(n+1),previous(n+1),current(n+1);
                for(int i=x;i<=n;++i)binomial[i]=choose(i-1,x-1);
                previous[0]=1;
                for(int boxes=1;boxes<=k;++boxes){
                    fill(current.begin(),current.end(),0);
                    int last=n-(k-boxes)*x;
                    for(int balls=boxes*x;balls<=last;++balls){
                        long long exact=binomial[balls]*previous[balls-x]%MOD;
                        current[balls]=boxes*(current[balls-1]+exact)%MOD;
                    }
                    previous.swap(current);
                }
                for(int query:queries)answers[query]=previous[sizes[query]];
    }
    for(int tc=0;tc<t;++tc)cout<<"Case "<<tc+1<<": "<<answers[tc]<<'\n';
}
