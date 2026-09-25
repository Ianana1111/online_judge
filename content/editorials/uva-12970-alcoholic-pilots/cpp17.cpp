#include <iostream>
#include <numeric>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    long long v1,d1,v2,d2;int caseNo=0;
    while(cin>>v1>>d1>>v2>>d2&&(v1||d1||v2||d2)) {
        bool captain=d1*v2<d2*v1;
        long long numerator=d1*v2+d2*v1,denominator=2*v1*v2;
        long long divisor=gcd(numerator,denominator);numerator/=divisor;denominator/=divisor;
        cout<<"Case #"<<++caseNo<<": "<<(captain?"You owe me a beer!":"No beer for the captain.")<<'\n';
        cout<<"Avg. arrival time: "<<numerator;
        if(denominator!=1)cout<<'/'<<denominator;
        cout<<'\n';
    }
}
