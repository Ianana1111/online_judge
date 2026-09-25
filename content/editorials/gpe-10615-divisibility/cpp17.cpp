#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
const int MOD=1000000009;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    for(int tc=1;tc<=t;++tc){
        int n,prime;cin>>n>>prime;
        vector<long long> lower(n),upper(n);
        for(auto &v:lower)cin>>v;for(auto &v:upper)cin>>v;
        vector<vector<int>> lowDigits(n),highDigits(n);int length=1;
        for(int i=0;i<n;++i){
            long long a=lower[i],b=upper[i];
            do{lowDigits[i].push_back(a%prime);highDigits[i].push_back(b%prime);a/=prime;b/=prime;}while(b);
            length=max(length,(int)highDigits[i].size());
        }
        for(int i=0;i<n;++i){lowDigits[i].resize(length);highDigits[i].resize(length);}
        int states=1<<(2*n),width=prime,initial=states-1;
        vector<int> dp(states);dp[initial]=1;vector<int> active{initial};
        for(int pos=length-1;pos>=0;--pos){
            vector<int> current(states*width),next(states*width);
            for(int code:active)current[code*width]=dp[code];
            for(int coordinate=0;coordinate<n;++coordinate){
                fill(next.begin(),next.end(),0);vector<int> nextActive;vector<char> seen(states);
                int shift=2*coordinate,ld=lowDigits[coordinate][pos],ud=highDigits[coordinate][pos];
                for(int code:active){
                    int flag=(code>>shift)&3;
                    auto transfer=[&](int lo,int hi,int nextFlag){
                        if(lo>hi)return;
                        int target=(code&~(3<<shift))|(nextFlag<<shift),window=0;
                        for(int sum=0;sum<width;++sum){
                            if(sum>=lo){window+=current[code*width+sum-lo];if(window>=MOD)window-=MOD;}
                            if(sum>hi){window-=current[code*width+sum-hi-1];if(window<0)window+=MOD;}
                            if(window){
                                int &cell=next[target*width+sum];cell+=window;if(cell>=MOD)cell-=MOD;
                                if(!seen[target]){seen[target]=true;nextActive.push_back(target);}
                            }
                        }
                    };
                    if(flag==0)transfer(0,prime-1,0);
                    else if(flag==1){transfer(ld,ld,1);transfer(ld+1,prime-1,0);}
                    else if(flag==2){transfer(0,ud-1,0);transfer(ud,ud,2);}
                    else if(ld==ud)transfer(ld,ld,3);
                    else{transfer(ld,ld,1);transfer(ld+1,ud-1,0);transfer(ud,ud,2);}
                }
                current.swap(next);active.swap(nextActive);
            }
            fill(dp.begin(),dp.end(),0);
            for(int code:active)for(int sum=0;sum<width;++sum){dp[code]+=current[code*width+sum];if(dp[code]>=MOD)dp[code]-=MOD;}
        }
        int answer=0;for(int code:active){answer+=dp[code];if(answer>=MOD)answer-=MOD;}
        cout<<"Case "<<tc<<": "<<answer<<'\n';
    }
}
