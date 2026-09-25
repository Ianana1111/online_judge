#include <algorithm>
#include <climits>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while(cin>>n&&n) {
        long long a,b,total=0;cin>>a>>b;vector<int> frequency(101),prefix(101);int largest=0;
        for(int i=0;i<n;++i){int y;cin>>y;++frequency[y];total+=y;largest=max(largest,y);}
        for(int y=1;y<=100;++y)prefix[y]=prefix[y-1]+frequency[y];
        long long bestNum=LLONG_MAX,bestDen=1;
        for(int p=1;p<=100;++p)if(frequency[p])for(int q=1;q<=3;++q) {
            if(3*p<largest*q)continue;
            long long visits=3LL*n-prefix[min(100,p/q)]-prefix[min(100,2*p/q)];
            long long numerator=(a*p+b*q)*visits-a*total*q;
            if(bestNum==LLONG_MAX||numerator*bestDen<bestNum*q){bestNum=numerator;bestDen=q;}
        }
        long long g=gcd(bestNum,bestDen);bestNum/=g;bestDen/=g;
        cout<<bestNum;if(bestDen!=1)cout<<" / "<<bestDen;cout<<'\n';
    }
}
