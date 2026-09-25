#include <algorithm>
#include <climits>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
using ll=long long;
using Runs=vector<pair<char,ll>>;
void append(Runs &r,char ch,ll count){if(!count)return;if(!r.empty()&&r.back().first==ch)r.back().second+=count;else r.push_back({ch,count});}
bool lexLess(const Runs &a,const Runs &b){
    size_t i=0,j=0;ll usedA=0,usedB=0;
    while(i<a.size()&&j<b.size()){
        if(a[i].first!=b[j].first)return a[i].first<b[j].first;
        ll take=min(a[i].second-usedA,b[j].second-usedB);usedA+=take;usedB+=take;
        if(usedA==a[i].second){++i;usedA=0;}
        if(usedB==b[j].second){++j;usedB=0;}
    }
    return i==a.size()&&j<b.size();
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    ll a,m,p,q,r,s;int tc=0;
    while(cin>>a>>m>>p>>q>>r>>s && a){
        ll bestLength=LLONG_MAX;Runs best;vector<ll> powers{1};
        for(int k=0;q*powers[k]<=s;++k){
            ll low=max(0LL,(r-p*powers[k]+a-1)/a),high=(s-q*powers[k])/a;
            if(low<=high){
                for(int j=0;j<=k;++j){
                    ll value=((low+powers[j]-1)/powers[j])*powers[j];
                    if(value>high)continue;
                    ll rest=value,length=k;Runs program;
                    for(int pos=k;pos>=0;--pos){
                        ll digit=rest/powers[pos];rest%=powers[pos];length+=digit;
                        append(program,'A',digit);if(pos)append(program,'M',1);
                    }
                    if(length<bestLength || (length==bestLength&&lexLess(program,best))){bestLength=length;best=program;}
                }
            }
            if(m==1 || powers[k]>s/m)break;
            powers.push_back(powers[k]*m);
        }
        cout<<"Case "<<++tc<<": ";
        if(bestLength==LLONG_MAX)cout<<"impossible";
        else if(best.empty())cout<<"empty";
        else for(size_t i=0;i<best.size();++i){if(i)cout<<' ';cout<<best[i].second<<best[i].first;}
        cout<<'\n';
    }
}
