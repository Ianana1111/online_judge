#include <bits/stdc++.h>
using namespace std;
using ll=long long;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    vector<ll> factorial(21,1);for(int i=1;i<=20;++i)factorial[i]=factorial[i-1]*i;
    int t;cin>>t;
    while(t--){
        string word;ll rank;cin>>word>>rank;array<int,26> count{};
        for(char ch:word)++count[ch-'a'];string answer;
        for(int remaining=(int)word.size();remaining>0;--remaining){
            for(int ch=0;ch<26;++ch)if(count[ch]){
                --count[ch];ll ways=factorial[remaining-1];
                for(int frequency:count)ways/=factorial[frequency];
                if(rank<ways){answer.push_back('a'+ch);break;}
                rank-=ways;++count[ch];
            }
        }
        cout<<answer<<'\n';
    }
}
