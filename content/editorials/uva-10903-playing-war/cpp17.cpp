#include <iostream>
#include <string>
#include <vector>
using namespace std;

string fixed_ratio(long long numerator,long long denominator,int digits){
    long long scale=1;for(int i=0;i<digits;++i)scale*=10;
    long long value=(2*numerator*scale+denominator)/(2*denominator);
    string fraction=to_string(value%scale);
    return to_string(value/scale)+"."+string(digits-fraction.size(),'0')+fraction;
}

int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int n,k;bool first=true;
    while(cin>>n && n){
        cin>>k;vector<int> wins(n),losses(n);
        for(int game=0;game<k*n*(n-1)/2;++game){
            int a,b;string x,y;cin>>a>>x>>b>>y;--a;--b;
            if(x==y)continue;
            bool win=(x=="rock"&&y=="scissors")||(x=="scissors"&&y=="paper")||(x=="paper"&&y=="rock");
            if(win){++wins[a];++losses[b];}else{++wins[b];++losses[a];}
        }
        if(!first)cout<<'\n';first=false;
        for(int i=0;i<n;++i){
            int games=wins[i]+losses[i];
            if(games==0)cout<<"-\n";
            else cout<<fixed_ratio(wins[i],games,3)<<'\n';
        }
    }
}
