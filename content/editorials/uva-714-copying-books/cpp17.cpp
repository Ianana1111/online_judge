#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int tests;cin>>tests;
    while(tests--){
        int n,k;cin>>n>>k;vector<long long> pages(n);for(auto &x:pages)cin>>x;
        long long lo=*max_element(pages.begin(),pages.end()),hi=accumulate(pages.begin(),pages.end(),0LL);
        while(lo<hi){
            long long limit=lo+(hi-lo)/2,current=0;int groups=1;
            for(long long x:pages){if(current+x>limit){++groups;current=0;}current+=x;}
            if(groups<=k)hi=limit;else lo=limit+1;
        }
        vector<bool> split(n);long long current=0;int groups=k;
        for(int i=n-1;i>=0;--i){
            if(current+pages[i]>lo||i+1<groups){split[i]=true;--groups;current=0;}
            current+=pages[i];
        }
        for(int i=0;i<n;++i){if(i)cout<<' ';cout<<pages[i];if(split[i])cout<<" /";}
        cout<<'\n';
    }
}
