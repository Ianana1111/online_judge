#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--){
        long long n;cin>>n;
        if(n<2){cout<<n<<'\n';continue;}
        int exponent[4]={},prime[4]={2,3,5,7};long long rest=n;
        for(int i=0;i<4;++i)while(rest%prime[i]==0){++exponent[i];rest/=prime[i];}
        if(rest!=1){cout<<"-1\n";continue;}
        int a=exponent[0],b=exponent[1];string best;
        for(int sixes=0;sixes<=min(a,b);++sixes){
            int twos=a-sixes,threes=b-sixes;
            string digits(sixes,'6');digits+=string(exponent[2],'5');digits+=string(exponent[3],'7');
            digits+=string(twos/3,'8');twos%=3;
            if(twos==2)digits+='4';else if(twos==1)digits+='2';
            digits+=string(threes/2,'9');if(threes%2)digits+='3';
            sort(digits.begin(),digits.end());
            if(best.empty()||digits.size()<best.size()||(digits.size()==best.size()&&digits<best))best=digits;
        }
        cout<<best<<'\n';
    }
}
