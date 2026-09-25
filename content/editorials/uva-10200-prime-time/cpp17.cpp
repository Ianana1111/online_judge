#include <algorithm>
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
    ios::sync_with_stdio(false);cin.tie(nullptr);
    vector<int> primes,prefix(10002);vector<bool> composite(10002);
    for(int i=2;i<=10001;++i)if(!composite[i]){
        primes.push_back(i);for(int j=i*i;j<=10001;j+=i)composite[j]=true;
    }
    for(int n=0;n<=10000;++n){
        int value=n*n+n+41;bool prime=true;
        for(int divisor:primes){
            if(1LL*divisor*divisor>value)break;
            if(value%divisor==0){prime=false;break;}
        }
        prefix[n+1]=prefix[n]+prime;
    }
    int a,b;
    while(cin>>a>>b){
        int count=prefix[b+1]-prefix[a];
        cout<<fixed_ratio(100LL*count,b-a+1,2)<<'\n';
    }
}
