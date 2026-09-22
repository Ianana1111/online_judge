#include <algorithm>
#include <iostream>
#include <map>
#include <vector>
using namespace std;
int h,k,best;
void search(int used,int last,int coverage,const vector<int>& coins){
    if(used==k){best=max(best,coverage);return;}
    int upper=coverage;
    for(int left=used;left<k;++left)upper=h*(upper+1);
    if(upper<=best)return;
    for(int denomination=coverage+1;denomination>last;--denomination){
        vector<int> next(h*denomination+1,h+1);
        copy(coins.begin(),coins.end(),next.begin());
        for(int value=denomination;value<(int)next.size();++value)
            next[value]=min(next[value],next[value-denomination]+1);
        int range=coverage;
        while(range+1<(int)next.size()&&next[range+1]<=h)++range;
        search(used+1,denomination,range,next);
    }
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    map<pair<int,int>,int> cache;
    while(cin>>h>>k&&(h||k)){
        auto key=make_pair(h,k);
        if(!cache.count(key)){
            best=0;vector<int> coins(h+1);for(int i=0;i<=h;++i)coins[i]=i;
            search(1,1,h,coins);cache[key]=best;
        }
        cout<<cache[key]<<'\n';
    }
}
