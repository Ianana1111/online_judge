#include <bits/stdc++.h>
using namespace std;
using ll=long long;
vector<pair<ll,uint32_t>> half_sums(const vector<ll>& a,int begin,int length){
 vector<pair<ll,uint32_t>> out(1u<<length);out[0]={0,0};
 for(uint32_t mask=1;mask<out.size();++mask){uint32_t bit=mask&-mask;int index=__builtin_ctz(bit);out[mask]={out[mask^bit].first+a[begin+index],mask};}
 sort(out.begin(),out.end());return out;
}
int main(){
 ios::sync_with_stdio(false);cin.tie(nullptr);string line;bool first=true;
 while(getline(cin,line)){
  if(line==".")break;if(line.empty())continue;
  for(char &ch:line)if(ch=='{'||ch=='}')ch=' ';
  stringstream in(line);vector<ll>a;ll value;while(in>>value)a.push_back(value);sort(a.begin(),a.end());
  ll total=accumulate(a.begin(),a.end(),0LL);vector<uint32_t> answers;
  if(total%2==0){
   int middle=a.size()/2;auto left=half_sums(a,0,middle),right=half_sums(a,middle,a.size()-middle);
   for(auto [sum,mask]:left){
    ll target=total/2-sum;
    auto lo=lower_bound(right.begin(),right.end(),make_pair(target,uint32_t(0)));
    auto hi=upper_bound(right.begin(),right.end(),make_pair(target,UINT32_MAX));
    for(auto at=lo;at!=hi;++at)answers.push_back(mask|(at->second<<middle));
   }
  }
  sort(answers.begin(),answers.end(),[](uint32_t a,uint32_t b){
   int x=__builtin_popcount(a),y=__builtin_popcount(b);if(x!=y)return x<y;
   uint32_t difference=a^b;if(!difference)return false;
   return (a&(difference&-difference))!=0;
  });
  if(!first)cout<<'\n';first=false;
  if(answers.empty()){cout<<"No such subset\n";continue;}
  cout<<answers.size()<<" subsets.\n";
  for(uint32_t mask:answers){
   cout<<'{';bool initial=true;
   for(int i=0;i<(int)a.size();++i)if(mask>>i&1){if(!initial)cout<<' ';initial=false;cout<<a[i];}
   cout<<"}\n";
  }
 }
}
